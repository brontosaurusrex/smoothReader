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
import subprocess
import threading
import wave
from collections import deque
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


APP_DIR = Path(__file__).resolve().parent
MAX_REQUEST_BYTES = 32_000
MAX_TEXT_LENGTH = 8_000
CACHE_FORMAT_VERSION = 4
LOUDNORM_FILTER = "loudnorm=I=-16:LRA=11:TP=-1.5"
OPUS_BITRATE_KBPS = 48
CACHE_ID_PATTERN = re.compile(r"^[a-f0-9]{64}$")
SESSION_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{8,128}$")


class SpeechCancelled(RuntimeError):
    """Raised when one browser session cancels its queued or active speech job."""


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
        self.ffmpeg_bin = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg")
        self._queue_condition = threading.Condition()
        self._generation_queue: deque[tuple[object, str, int]] = deque()
        self._generation_active = False
        self._session_versions: dict[str, int] = {}
        self._generation_processes: dict[str, subprocess.Popen[bytes]] = {}

    def voices(self) -> list[Path]:
        if not self.voice_dir.is_dir():
            return []
        return sorted(self.voice_dir.glob("*.onnx"), key=lambda path: path.name.lower())

    def status(self) -> dict[str, Any]:
        voices = self.voices()
        missing = []
        if not self.piper_bin:
            missing.append("piper")
        if not self.ffmpeg_bin:
            missing.append("ffmpeg")
        if not voices:
            missing.append(f"*.onnx voices in {self.voice_dir}")
        with self._queue_condition:
            queued = len(self._generation_queue)
            active = self._generation_active
        return {
            "ok": True,
            "available": not missing,
            "voices": [voice.name for voice in voices],
            "voiceDirectory": str(self.voice_dir),
            "cacheDirectory": str(self.cache_dir),
            "loudnorm": LOUDNORM_FILTER,
            "audioCodec": "opus",
            "audioBitrateKbps": OPUS_BITRATE_KBPS,
            "queued": queued,
            "active": active,
            "paused": False,
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
        audio_format: str,
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
            "audioFormat": audio_format,
            "opusBitrateKbps": OPUS_BITRATE_KBPS if audio_format == "opus" else None,
        }
        encoded = json.dumps(identity, ensure_ascii=False, sort_keys=True).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def _metadata_path(self, cache_id: str) -> Path:
        if not CACHE_ID_PATTERN.fullmatch(cache_id):
            raise ValueError("Invalid audio cache identifier")
        return self.cache_dir / f"{cache_id}.json"

    def _cache_paths(self, cache_id: str, audio_format: str) -> tuple[Path, Path]:
        suffix = ".opus" if audio_format == "opus" else ".wav"
        return self.cache_dir / f"{cache_id}{suffix}", self._metadata_path(cache_id)

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

    @staticmethod
    def _validate_opus(opus_path: Path) -> None:
        try:
            with opus_path.open("rb") as audio:
                signature = audio.read(4)
        except OSError as error:
            raise RuntimeError("Piper generated an invalid Opus file") from error
        if signature != b"OggS":
            raise RuntimeError("Piper generated an invalid Opus file")

    def _read_cache_record(self, cache_id: str) -> dict[str, Any]:
        metadata_path = self._metadata_path(cache_id)
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise FileNotFoundError("Cached Piper metadata was not found") from error

        audio_format = metadata.get("audioFormat", "wav")
        if audio_format not in ("opus", "wav"):
            raise FileNotFoundError("Cached Piper audio format was invalid")
        audio_path, _ = self._cache_paths(cache_id, audio_format)
        if not audio_path.is_file() or audio_path.stat().st_size <= 44:
            raise FileNotFoundError("Cached Piper audio was not found")
        if audio_format == "wav":
            try:
                self._validate_wav(audio_path)
            except RuntimeError as error:
                raise FileNotFoundError("Cached Piper WAV was invalid") from error
        else:
            try:
                self._validate_opus(audio_path)
            except RuntimeError as error:
                raise FileNotFoundError("Cached Piper Opus file was invalid") from error
        metadata["audioPath"] = audio_path
        metadata["metadataPath"] = metadata_path
        return metadata

    @staticmethod
    def _prepared_result(
        metadata: dict[str, Any],
        cached: bool,
        speaker_count: int,
    ) -> dict[str, Any]:
        return {
            "ok": True,
            "cacheId": metadata["cacheId"],
            "cached": cached,
            "voice": metadata["voice"],
            "speaker": metadata["speaker"],
            "speakerCount": speaker_count,
            "sampleRate": metadata["sampleRate"],
            "audioFormat": metadata["audioFormat"],
            "mimeType": "audio/ogg" if metadata["audioFormat"] == "opus" else "audio/wav",
            "audioUrl": f"/api/piper/audio/{metadata['cacheId']}",
        }

    def _session_token(self, session_id: str) -> int:
        with self._queue_condition:
            return self._session_versions.setdefault(session_id, 0)

    def _ensure_session_current(self, session_id: str, token: int) -> None:
        with self._queue_condition:
            if self._session_versions.get(session_id, 0) != token:
                raise SpeechCancelled("Speech generation was stopped")

    def _acquire_generation_slot(self, session_id: str, token: int) -> None:
        ticket = object()
        with self._queue_condition:
            self._generation_queue.append((ticket, session_id, token))
            while True:
                if self._session_versions.get(session_id, 0) != token:
                    self._generation_queue = deque(
                        entry for entry in self._generation_queue if entry[0] is not ticket
                    )
                    self._queue_condition.notify_all()
                    raise SpeechCancelled("Speech generation was stopped")
                if not self._generation_active and self._generation_queue[0][0] is ticket:
                    self._generation_queue.popleft()
                    self._generation_active = True
                    return
                self._queue_condition.wait()

    def _release_generation_slot(self) -> None:
        with self._queue_condition:
            self._generation_active = False
            self._queue_condition.notify_all()

    def _register_process(
        self,
        session_id: str,
        token: int,
        process: subprocess.Popen[bytes],
    ) -> None:
        with self._queue_condition:
            if self._session_versions.get(session_id, 0) != token:
                process.terminate()
                raise SpeechCancelled("Speech generation was stopped")
            self._generation_processes[session_id] = process

    def _clear_process(self, session_id: str, process: subprocess.Popen[bytes]) -> None:
        with self._queue_condition:
            if self._generation_processes.get(session_id) is process:
                self._generation_processes.pop(session_id, None)

    def prepare(
        self,
        text: str,
        requested_voice: str | None,
        session_id: str,
        audio_format: str,
    ) -> dict[str, Any]:
        if not self.piper_bin:
            raise RuntimeError("piper must be installed")
        if not self.ffmpeg_bin:
            raise RuntimeError("ffmpeg must be installed")
        if not SESSION_ID_PATTERN.fullmatch(session_id):
            raise ValueError("Invalid speech session identifier")
        if audio_format not in ("opus", "wav"):
            raise ValueError("Unsupported speech audio format")
        model = self._select_voice(requested_voice, text)
        speaker_count, sample_rate = self._voice_config(model)
        speaker = self._speaker_for_text(text, model, speaker_count)
        cache_id = self._cache_identity(
            text, model, speaker, sample_rate, audio_format
        )
        audio_path, metadata_path = self._cache_paths(cache_id, audio_format)

        try:
            return self._prepared_result(
                self._read_cache_record(cache_id), True, speaker_count
            )
        except FileNotFoundError:
            pass

        token = self._session_token(session_id)
        self._acquire_generation_slot(session_id, token)
        try:
            self._ensure_session_current(session_id, token)
            try:
                return self._prepared_result(
                    self._read_cache_record(cache_id), True, speaker_count
                )
            except FileNotFoundError:
                pass

            temporary_prefix = (
                f".{cache_id}.{threading.get_ident()}.{random.randrange(1 << 30)}"
            )
            temporary_piper_wav = self.cache_dir / f"{temporary_prefix}.piper.tmp.wav"
            temporary_audio = self.cache_dir / (
                f"{temporary_prefix}.normalized.tmp."
                f"{'opus' if audio_format == 'opus' else 'wav'}"
            )
            piper_command = [
                self.piper_bin,
                "-s",
                str(speaker),
                "-m",
                str(model),
                "--output_file",
                str(temporary_piper_wav),
            ]
            try:
                process = subprocess.Popen(
                    piper_command,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                self._register_process(session_id, token, process)
                process.communicate(text.encode("utf-8"))
                self._clear_process(session_id, process)
                self._ensure_session_current(session_id, token)
                if process.returncode != 0:
                    raise RuntimeError("Piper audio generation failed")
                _, piper_sample_rate, _ = self._validate_wav(temporary_piper_wav)

                ffmpeg_command = [
                    self.ffmpeg_bin,
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-y",
                    "-i",
                    str(temporary_piper_wav),
                    "-af",
                    LOUDNORM_FILTER,
                    "-ac",
                    "1",
                ]
                if audio_format == "opus":
                    ffmpeg_command.extend([
                        "-ar", "48000",
                        "-c:a", "libopus",
                        "-b:a", f"{OPUS_BITRATE_KBPS}k",
                        "-vbr", "on",
                        "-application", "voip",
                        "-compression_level", "10",
                        "-f", "opus",
                    ])
                else:
                    ffmpeg_command.extend([
                        "-ar", str(piper_sample_rate),
                        "-c:a", "pcm_s16le",
                    ])
                ffmpeg_command.append(str(temporary_audio))
                process = subprocess.Popen(
                    ffmpeg_command,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.PIPE,
                )
                self._register_process(session_id, token, process)
                _, ffmpeg_error = process.communicate()
                self._clear_process(session_id, process)
                self._ensure_session_current(session_id, token)
                if process.returncode != 0:
                    detail = ffmpeg_error.decode("utf-8", errors="replace").strip()
                    raise RuntimeError(
                        f"FFmpeg loudnorm failed{f': {detail[-400:]}' if detail else ''}"
                    )
                if audio_format == "wav":
                    _, actual_sample_rate, _ = self._validate_wav(temporary_audio)
                else:
                    self._validate_opus(temporary_audio)
                    actual_sample_rate = 48_000

                metadata = {
                    "cacheId": cache_id,
                    "voice": model.name,
                    "speaker": speaker,
                    "speakerCount": speaker_count,
                    "sampleRate": actual_sample_rate,
                    "audioFormat": audio_format,
                }
                temporary_metadata = self.cache_dir / f"{temporary_prefix}.json.tmp"
                temporary_metadata.write_text(json.dumps(metadata), encoding="utf-8")
                temporary_audio.replace(audio_path)
                temporary_metadata.replace(metadata_path)
                self._prune_cache(cache_id)
                return self._prepared_result(metadata, False, speaker_count)
            finally:
                process = locals().get("process")
                if process is not None:
                    self._clear_process(session_id, process)
                temporary_piper_wav.unlink(missing_ok=True)
                temporary_audio.unlink(missing_ok=True)
                (self.cache_dir / f"{temporary_prefix}.json.tmp").unlink(missing_ok=True)
        finally:
            self._release_generation_slot()

    def audio_path(self, cache_id: str) -> tuple[Path, str]:
        metadata = self._read_cache_record(cache_id)
        try:
            os.utime(metadata["audioPath"], None)
            os.utime(metadata["metadataPath"], None)
        except OSError:
            pass
        return metadata["audioPath"], metadata["audioFormat"]

    def stop(self, session_id: str) -> None:
        if not SESSION_ID_PATTERN.fullmatch(session_id):
            raise ValueError("Invalid speech session identifier")
        with self._queue_condition:
            self._session_versions[session_id] = self._session_versions.get(session_id, 0) + 1
            generation_process = self._generation_processes.get(session_id)
            self._queue_condition.notify_all()
        if generation_process and generation_process.poll() is None:
            generation_process.terminate()

    def stop_all(self) -> None:
        with self._queue_condition:
            processes = list(self._generation_processes.values())
            for session_id in list(self._session_versions):
                self._session_versions[session_id] += 1
            self._queue_condition.notify_all()
        for process in processes:
            if process.poll() is None:
                process.terminate()

    def _prune_cache(self, protected_cache_id: str) -> None:
        files = []
        total = 0
        for audio_path in [*self.cache_dir.glob("*.opus"), *self.cache_dir.glob("*.wav")]:
            try:
                stat = audio_path.stat()
            except OSError:
                continue
            total += stat.st_size
            files.append((stat.st_mtime_ns, stat.st_size, audio_path))
        if total <= self.cache_max_bytes:
            return
        for _, size, audio_path in sorted(files):
            if audio_path.stem == protected_cache_id:
                continue
            audio_path.unlink(missing_ok=True)
            audio_path.with_suffix(".json").unlink(missing_ok=True)
            total -= size
            if total <= self.cache_max_bytes:
                break


class SmoothReaderHandler(SimpleHTTPRequestHandler):
    controller: PiperController

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def end_headers(self) -> None:
        request_path = self.path.split("?", 1)[0]
        if request_path.startswith("/vendor/fonts/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif not request_path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

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

    def _send_audio(self, cache_id: str) -> None:
        audio_path, audio_format = self.controller.audio_path(cache_id)
        file_size = audio_path.stat().st_size
        start = 0
        end = file_size - 1
        status = HTTPStatus.OK
        range_header = self.headers.get("Range")

        if range_header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
            if not match or (not match.group(1) and not match.group(2)):
                self.send_error(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                return
            if match.group(1):
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else end
            else:
                suffix_length = int(match.group(2))
                start = max(0, file_size - suffix_length)
            if start >= file_size or end < start:
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{file_size}")
                self.end_headers()
                return
            end = min(end, file_size - 1)
            status = HTTPStatus.PARTIAL_CONTENT

        content_length = end - start + 1
        self.send_response(status)
        self.send_header(
            "Content-Type", "audio/ogg" if audio_format == "opus" else "audio/wav"
        )
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(content_length))
        self.send_header("Cache-Control", "private, max-age=31536000, immutable")
        if status == HTTPStatus.PARTIAL_CONTENT:
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.end_headers()

        try:
            with audio_path.open("rb") as audio_file:
                audio_file.seek(start)
                remaining = content_length
                while remaining > 0:
                    block = audio_file.read(min(64 * 1024, remaining))
                    if not block:
                        break
                    self.wfile.write(block)
                    remaining -= len(block)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/piper/status":
            self._json_response(HTTPStatus.OK, self.controller.status())
            return
        request_path = self.path.split("?", 1)[0]
        audio_prefix = "/api/piper/audio/"
        if request_path.startswith(audio_prefix):
            try:
                self._send_audio(request_path.removeprefix(audio_prefix))
            except ValueError as error:
                self._json_response(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
            except FileNotFoundError as error:
                self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": str(error)})
            except Exception as error:
                self.log_error("Piper audio error: %s", error)
                self._json_response(
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    {"ok": False, "error": str(error)},
                )
            return
        for validator in ("If-Modified-Since", "If-None-Match"):
            if validator in self.headers:
                del self.headers[validator]
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        try:
            payload = self._read_payload()
            if self.path == "/api/piper/stop":
                self.controller.stop(str(payload.get("sessionId", "")))
                self._json_response(HTTPStatus.OK, {"ok": True})
                return

            if self.path in ("/api/piper/prepare", "/api/piper/speak"):
                text = str(payload.get("text", "")).strip()
                if not text or len(text) > MAX_TEXT_LENGTH:
                    raise ValueError("Speech text must contain 1 to 8000 characters")
                result = self.controller.prepare(
                    text,
                    payload.get("voice"),
                    str(payload.get("sessionId", "")),
                    str(payload.get("audioFormat", "opus")),
                )
                self._json_response(HTTPStatus.OK, result)
                return
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
        except (ValueError, json.JSONDecodeError) as error:
            self._json_response(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
        except FileNotFoundError as error:
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": str(error)})
        except SpeechCancelled as error:
            self._json_response(HTTPStatus.CONFLICT, {"ok": False, "error": str(error)})
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
        help="persistent directory for generated Piper Opus/WAV audio",
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
        SmoothReaderHandler.controller.stop_all()
        server.server_close()


if __name__ == "__main__":
    main()
