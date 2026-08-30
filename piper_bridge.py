#!/usr/bin/env python3
"""Loopback-only static server and Piper bridge for Smooth Reader."""

from __future__ import annotations

import argparse
import json
import os
import random
import shutil
import subprocess
import threading
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


APP_DIR = Path(__file__).resolve().parent
MAX_REQUEST_BYTES = 32_000
MAX_TEXT_LENGTH = 8_000


class PiperController:
    def __init__(self, voice_dir: Path) -> None:
        self.voice_dir = voice_dir.expanduser().resolve()
        configured_piper = os.environ.get("PIPER_BIN")
        local_piper = self.voice_dir / "piper"
        self.piper_bin = configured_piper or shutil.which("piper") or (
            str(local_piper) if local_piper.is_file() else None
        )
        self.mpv_bin = os.environ.get("MPV_BIN") or shutil.which("mpv")
        self._state_lock = threading.Lock()
        self._playback_lock = threading.Lock()
        self._piper_process: subprocess.Popen[bytes] | None = None
        self._mpv_process: subprocess.Popen[bytes] | None = None

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
        return {
            "ok": True,
            "available": not missing,
            "voices": [voice.name for voice in voices],
            "voiceDirectory": str(self.voice_dir),
            "error": f"Missing: {', '.join(missing)}" if missing else "",
        }

    def _select_voice(self, requested: str | None) -> Path:
        voices = self.voices()
        if not voices:
            raise RuntimeError(f"No .onnx voices found in {self.voice_dir}")
        if requested:
            requested_name = Path(requested).name
            match = next((voice for voice in voices if voice.name == requested_name), None)
            if not match:
                raise RuntimeError("The selected Piper voice is no longer available")
            return match
        return random.choice(voices)

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

    def stop(self) -> None:
        with self._state_lock:
            processes = (self._piper_process, self._mpv_process)
        for process in processes:
            if process and process.poll() is None:
                process.terminate()

    def speak(self, text: str, requested_voice: str | None) -> dict[str, Any]:
        if not self.piper_bin or not self.mpv_bin:
            raise RuntimeError("piper and mpv must both be installed")
        model = self._select_voice(requested_voice)
        speaker_count, sample_rate = self._voice_config(model)
        speaker = random.randrange(speaker_count)

        piper_command = [
            self.piper_bin,
            "-s",
            str(speaker),
            "-m",
            str(model),
            "--output-raw",
        ]
        mpv_command = [
            self.mpv_bin,
            "--demuxer=rawaudio",
            "--demuxer-rawaudio-format=s16le",
            f"--demuxer-rawaudio-rate={sample_rate}",
            f"--audio-samplerate={sample_rate}",
            "--demuxer-rawaudio-channels=1",
            "--no-resume-playback",
            "--no-video",
            "--no-input-default-bindings",
            "--msg-level=all=no",
            "--volume=90",
            "-",
        ]

        with self._playback_lock:
            piper_process = subprocess.Popen(
                piper_command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            assert piper_process.stdout is not None
            mpv_process = subprocess.Popen(
                mpv_command,
                stdin=piper_process.stdout,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            piper_process.stdout.close()
            with self._state_lock:
                self._piper_process = piper_process
                self._mpv_process = mpv_process

            try:
                assert piper_process.stdin is not None
                piper_process.stdin.write(text.encode("utf-8"))
                piper_process.stdin.close()
                piper_code = piper_process.wait()
                mpv_code = mpv_process.wait()
                if piper_code not in (0, -15) or mpv_code not in (0, -15):
                    raise RuntimeError("Piper playback failed")
            finally:
                with self._state_lock:
                    self._piper_process = None
                    self._mpv_process = None

        return {
            "ok": True,
            "voice": model.name,
            "speaker": speaker,
            "sampleRate": sample_rate,
        }


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

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/piper/status":
            self._json_response(HTTPStatus.OK, self.controller.status())
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if self.path == "/api/piper/stop":
            self.controller.stop()
            self._json_response(HTTPStatus.OK, {"ok": True})
            return
        if self.path != "/api/piper/speak":
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_REQUEST_BYTES:
                raise ValueError("Invalid request size")
            payload = json.loads(self.rfile.read(length))
            text = str(payload.get("text", "")).strip()
            if not text or len(text) > MAX_TEXT_LENGTH:
                raise ValueError("Speech text must contain 1 to 8000 characters")
            result = self.controller.speak(text, payload.get("voice"))
            self._json_response(HTTPStatus.OK, result)
        except (ValueError, json.JSONDecodeError) as error:
            self._json_response(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
        except Exception as error:  # Keep process details out of the browser response.
            self.log_error("Piper playback error: %s", error)
            self._json_response(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"ok": False, "error": str(error)},
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=9000)
    parser.add_argument(
        "--voice-dir",
        type=Path,
        default=Path(os.environ.get("PIPER_VOICE_DIR", "~/piper")),
        help="directory containing Piper .onnx and .onnx.json files",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SmoothReaderHandler.controller = PiperController(args.voice_dir)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), SmoothReaderHandler)
    print(f"Smooth Reader: http://127.0.0.1:{args.port}")
    status = SmoothReaderHandler.controller.status()
    print(status["error"] or f"Piper ready with {len(status['voices'])} voice(s)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        SmoothReaderHandler.controller.stop()
        server.server_close()


if __name__ == "__main__":
    main()
