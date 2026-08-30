#!/usr/bin/env python3
"""Loopback-only static server and cached Piper pipeline for Smooth Reader."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import re
import shutil
import signal
import subprocess
import threading
import wave
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


APP_DIR = Path(__file__).resolve().parent
MAX_REQUEST_BYTES = 32_000
MAX_TEXT_LENGTH = 8_000
CACHE_FORMAT_VERSION = 2
LOUDNORM_FILTER = "lavfi=[loudnorm=I=-16:LRA=11:TP=-1.5]"
CACHE_ID_PATTERN = re.compile(r"^[a-f0-9]{64}$")


class PiperController:
    def __init__(self, voice_dir: Path, cache_dir: Path, cache_max_mb: int) -> None:
        self.voice_dir = voice_dir.expanduser().resolve()
        self.cache_dir = cache_dir.expanduser().resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.cache_max_bytes = max(1, cache_max_mb) * 1024 * 1024
        configured_piper = os.environ.get("PIPER_BIN")
        local_piper = self.voice_dir / "piper"
        self.piper_bin = configured_piper or shutil.which("piper") or (
            str(local_piper) if local_piper.is_file() else None
        )
        self.mpv_bin = os.environ.get("MPV_BIN") or shutil.which("mpv")
        self._state_lock = threading.Lock()
        self._generation_lock = threading.Lock()
        self._playback_lock = threading.Lock()
        self._generation_process: subprocess.Popen[bytes] | None = None
        self._mpv_process: subprocess.Popen[bytes] | None = None
        self._paused = False

    def voices(self) -> list[Path]:
        if not self.voice_dir.is_dir():
            return []
        return sorted(self.voice_dir.glob("*.onnx"), key=lambda path: path.name.lower())

    def status(self) -> dict[str, Any]:
        voices = self.voices()
        missing = []
        if not self.piper_bin:
            missing.append("piper")
        if not self.mpv_bin:
            missing.append("mpv")
        if not voices:
            missing.append(f"*.onnx voices in {self.voice_dir}")
        with self._state_lock:
            active = self._mpv_process is not None and self._mpv_process.poll() is None
            paused = active and self._paused
        return {
            "ok": True,
            "available": not missing,
            "voices": [voice.name for voice in voices],
            "voiceDirectory": str(self.voice_dir),
            "cacheDirectory": str(self.cache_dir),
            "loudnorm": LOUDNORM_FILTER,
            "active": active,
            "paused": paused,
            "error": f"Missing: {', '.join(missing)}" if missing else "",
        }

    def _select_voice(self, requested: str | None, text: str) -> Path:
        voices = self.voices()
        if not voices:
            raise RuntimeError(f"No .onnx voices found in {self.voice_dir}")
        if requested:
            requested_name = Path(requested).name
            match = next((voice for voice in voices if voice.name == requested_name), None)
            if not match:
                raise RuntimeError("The selected Piper voice is no longer available")
            return match
        seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest()[:8], "big")
        return voices[seed % len(voices)]

    @staticmethod
    def _voice_config(model: Path) -> tuple[int, int]:
        config_path = Path(f"{model}.json")
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return 1, 22_050
        speakers = max(1, int(config.get("num_speakers", 1) or 1))
        sample_rate = int(config.get("audio", {}).get("sample_rate", 22_050) or 22_050)
        return speakers, sample_rate

    @staticmethod
    def _speaker_for_text(text: str, model: Path, speaker_count: int) -> int:
        digest = hashlib.sha256(f"{model.name}\0{text}".encode("utf-8")).digest()
        return int.from_bytes(digest[:8], "big") % speaker_count

    def _cache_identity(
        self,
        text: str,
        model: Path,
        speaker: int,
        sample_rate: int,
    ) -> str:
        try:
            model_stat = model.stat()
            model_identity = [model.name, model_stat.st_size, model_stat.st_mtime_ns]
        except OSError:
            model_identity = [model.name, 0, 0]
        identity = {
            "version": CACHE_FORMAT_VERSION,
            "text": text,
            "model": model_identity,
            "speaker": speaker,
            "sampleRate": sample_rate,
        }
        encoded = json.dumps(identity, ensure_ascii=False, sort_keys=True).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def _cache_paths(self, cache_id: str) -> tuple[Path, Path]:
        if not CACHE_ID_PATTERN.fullmatch(cache_id):
            raise ValueError("Invalid audio cache identifier")
        return self.cache_dir / f"{cache_id}.wav", self.cache_dir / f"{cache_id}.json"

    @staticmethod
    def _validate_wav(wav_path: Path) -> tuple[int, int, int]:
        try:
            with wave.open(str(wav_path), "rb") as audio:
                channels = audio.getnchannels()
                sample_rate = audio.getframerate()
                frame_count = audio.getnframes()
                sample_width = audio.getsampwidth()
        except (OSError, EOFError, wave.Error) as error:
            raise RuntimeError("Piper generated an invalid WAV file") from error
        if channels < 1 or sample_rate < 1 or frame_count < 1 or sample_width < 1:
            raise RuntimeError("Piper generated an empty WAV file")
        return channels, sample_rate, frame_count

    def _read_cache_record(self, cache_id: str) -> dict[str, Any]:
        wav_path, metadata_path = self._cache_paths(cache_id)
        if not wav_path.is_file() or wav_path.stat().st_size <= 44:
            raise FileNotFoundError("Cached Piper audio was not found")
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise FileNotFoundError("Cached Piper metadata was not found") from error
        try:
            self._validate_wav(wav_path)
        except RuntimeError as error:
            raise FileNotFoundError("Cached Piper WAV was invalid") from error
        metadata["wavPath"] = wav_path
        metadata["metadataPath"] = metadata_path
        return metadata

    @staticmethod
    def _prepared_result(metadata: dict[str, Any], cached: bool) -> dict[str, Any]:
        return {
            "ok": True,
            "cacheId": metadata["cacheId"],
            "cached": cached,
            "voice": metadata["voice"],
            "speaker": metadata["speaker"],
            "sampleRate": metadata["sampleRate"],
        }

    def prepare(self, text: str, requested_voice: str | None) -> dict[str, Any]:
        if not self.piper_bin:
            raise RuntimeError("piper must be installed")
        model = self._select_voice(requested_voice, text)
        speaker_count, sample_rate = self._voice_config(model)
        speaker = self._speaker_for_text(text, model, speaker_count)
        cache_id = self._cache_identity(text, model, speaker, sample_rate)
        wav_path, metadata_path = self._cache_paths(cache_id)

        try:
            return self._prepared_result(self._read_cache_record(cache_id), True)
        except FileNotFoundError:
            pass

        with self._generation_lock:
            try:
                return self._prepared_result(self._read_cache_record(cache_id), True)
            except FileNotFoundError:
                pass

            temporary_wav = self.cache_dir / (
                f".{cache_id}.{threading.get_ident()}.{random.randrange(1 << 30)}.tmp.wav"
            )
            piper_command = [
                self.piper_bin,
                "-s",
                str(speaker),
                "-m",
                str(model),
                "--output_file",
                str(temporary_wav),
            ]
            try:
                process = subprocess.Popen(
                    piper_command,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                with self._state_lock:
                    self._generation_process = process
                process.communicate(text.encode("utf-8"))
                if process.returncode != 0:
                    raise RuntimeError("Piper audio generation failed")
                _, actual_sample_rate, _ = self._validate_wav(temporary_wav)

                metadata = {
                    "cacheId": cache_id,
                    "voice": model.name,
                    "speaker": speaker,
                    "sampleRate": actual_sample_rate,
                }
                temporary_metadata = temporary_wav.with_suffix(".json.tmp")
                temporary_metadata.write_text(json.dumps(metadata), encoding="utf-8")
                temporary_wav.replace(wav_path)
                temporary_metadata.replace(metadata_path)
                self._prune_cache(cache_id)
                return self._prepared_result(metadata, False)
            finally:
                with self._state_lock:
                    self._generation_process = None
                temporary_wav.unlink(missing_ok=True)
                temporary_wav.with_suffix(".json.tmp").unlink(missing_ok=True)

    def play(self, cache_id: str) -> dict[str, Any]:
        if not self.mpv_bin:
            raise RuntimeError("mpv must be installed")
        metadata = self._read_cache_record(cache_id)
        wav_path = metadata["wavPath"]
        mpv_command = [
            self.mpv_bin,
            "--no-resume-playback",
            "--no-video",
            "--no-input-default-bindings",
            "--msg-level=all=no",
            "--volume=90",
            f"--af={LOUDNORM_FILTER}",
            str(wav_path),
        ]

        with self._playback_lock:
            process = subprocess.Popen(
                mpv_command,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            with self._state_lock:
                self._mpv_process = process
                self._paused = False
            try:
                return_code = process.wait()
                if return_code not in (0, -signal.SIGTERM):
                    raise RuntimeError("Cached Piper playback failed")
                try:
                    os.utime(wav_path, None)
                    os.utime(metadata["metadataPath"], None)
                except OSError:
                    pass
            finally:
                with self._state_lock:
                    self._mpv_process = None
                    self._paused = False

        return {
            "ok": True,
            "cacheId": cache_id,
            "voice": metadata["voice"],
            "speaker": metadata["speaker"],
            "loudnorm": LOUDNORM_FILTER,
        }

    def set_paused(self, paused: bool) -> dict[str, Any]:
        with self._state_lock:
            process = self._mpv_process
            active = process is not None and process.poll() is None
            if not active:
                self._paused = False
                return {"ok": True, "active": False, "paused": False}
            try:
                process.send_signal(signal.SIGSTOP if paused else signal.SIGCONT)
            except ProcessLookupError:
                self._paused = False
                return {"ok": True, "active": False, "paused": False}
            self._paused = paused
            return {"ok": True, "active": True, "paused": paused}

    def stop(self) -> None:
        with self._state_lock:
            generation_process = self._generation_process
            mpv_process = self._mpv_process
            was_paused = self._paused
            self._paused = False
        if was_paused and mpv_process and mpv_process.poll() is None:
            try:
                mpv_process.send_signal(signal.SIGCONT)
            except ProcessLookupError:
                pass
        for process in (generation_process, mpv_process):
            if process and process.poll() is None:
                process.terminate()

    def _prune_cache(self, protected_cache_id: str) -> None:
        files = []
        total = 0
        for wav_path in self.cache_dir.glob("*.wav"):
            try:
                stat = wav_path.stat()
            except OSError:
                continue
            total += stat.st_size
            files.append((stat.st_mtime_ns, stat.st_size, wav_path))
        if total <= self.cache_max_bytes:
            return
        for _, size, wav_path in sorted(files):
            if wav_path.stem == protected_cache_id:
                continue
            wav_path.unlink(missing_ok=True)
            wav_path.with_suffix(".json").unlink(missing_ok=True)
            total -= size
            if total <= self.cache_max_bytes:
                break


class SmoothReaderHandler(SimpleHTTPRequestHandler):
    controller: PiperController

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def _json_response(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def _read_payload(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > MAX_REQUEST_BYTES:
            raise ValueError("Invalid request size")
        payload = json.loads(self.rfile.read(length))
        if not isinstance(payload, dict):
            raise ValueError("JSON request must be an object")
        return payload

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/piper/status":
            self._json_response(HTTPStatus.OK, self.controller.status())
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if self.path == "/api/piper/pause":
            self._json_response(HTTPStatus.OK, self.controller.set_paused(True))
            return
        if self.path == "/api/piper/resume":
            self._json_response(HTTPStatus.OK, self.controller.set_paused(False))
            return
        if self.path == "/api/piper/stop":
            self.controller.stop()
            self._json_response(HTTPStatus.OK, {"ok": True})
            return

        try:
            payload = self._read_payload()
            if self.path in ("/api/piper/prepare", "/api/piper/speak"):
                text = str(payload.get("text", "")).strip()
                if not text or len(text) > MAX_TEXT_LENGTH:
                    raise ValueError("Speech text must contain 1 to 8000 characters")
                result = self.controller.prepare(text, payload.get("voice"))
                if self.path == "/api/piper/speak":
                    playback = self.controller.play(result["cacheId"])
                    result = {**result, **playback}
                self._json_response(HTTPStatus.OK, result)
                return
            if self.path == "/api/piper/play":
                result = self.controller.play(str(payload.get("cacheId", "")))
                self._json_response(HTTPStatus.OK, result)
                return
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
        except (ValueError, json.JSONDecodeError) as error:
            self._json_response(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
        except FileNotFoundError as error:
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": str(error)})
        except Exception as error:  # Keep command details out of the browser response.
            self.log_error("Piper bridge error: %s", error)
            self._json_response(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"ok": False, "error": str(error)},
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument(
        "--voice-dir",
        type=Path,
        default=Path(os.environ.get("PIPER_VOICE_DIR", "~/piper")),
        help="directory containing Piper .onnx and .onnx.json files",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path(os.environ.get("PIPER_CACHE_DIR", "~/.cache/smooth-reader-piper")),
        help="persistent directory for generated Piper WAV audio",
    )
    parser.add_argument(
        "--cache-max-mb",
        type=int,
        default=1024,
        help="prune least-recently-used cached audio above this size (default: 1024)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SmoothReaderHandler.controller = PiperController(
        args.voice_dir,
        args.cache_dir,
        args.cache_max_mb,
    )
    server = ThreadingHTTPServer(("127.0.0.1", args.port), SmoothReaderHandler)
    print(f"Smooth Reader: http://127.0.0.1:{args.port}")
    status = SmoothReaderHandler.controller.status()
    print(status["error"] or f"Piper ready with {len(status['voices'])} voice(s)")
    print(f"Audio cache: {status['cacheDirectory']}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        SmoothReaderHandler.controller.stop()
        server.server_close()


if __name__ == "__main__":
    main()
