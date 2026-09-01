#!/usr/bin/env python3
"""Regression checks for multiuser Piper generation and cached browser audio."""

from __future__ import annotations

import importlib.util
import json
import os
import stat
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path


BRIDGE_PATH = Path(__file__).resolve().parents[1] / "piper_bridge.py"
SPEC = importlib.util.spec_from_file_location("smooth_reader_piper_bridge", BRIDGE_PATH)
assert SPEC and SPEC.loader
BRIDGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BRIDGE)


def make_executable(path: Path, source: str) -> None:
    path.write_text(f"#!{sys.executable}\n{source}", encoding="utf-8")
    path.chmod(path.stat().st_mode | stat.S_IXUSR)


with tempfile.TemporaryDirectory() as temporary_directory:
    root = Path(temporary_directory)
    voice_dir = root / "voices"
    cache_dir = root / "cache"
    voice_dir.mkdir()
    model = voice_dir / "test-voice.onnx"
    model.write_bytes(b"fake model")
    Path(f"{model}.json").write_text(
        json.dumps({"num_speakers": 2, "audio": {"sample_rate": 24_000}}),
        encoding="utf-8",
    )

    fake_piper = root / "fake-piper"
    make_executable(
        fake_piper,
        "import sys, time, wave\n"
        "text = sys.stdin.buffer.read()\n"
        "time.sleep(0.18)\n"
        "output_path = sys.argv[sys.argv.index('--output_file') + 1]\n"
        "with wave.open(output_path, 'wb') as audio:\n"
        "    audio.setnchannels(1)\n"
        "    audio.setsampwidth(2)\n"
        "    audio.setframerate(24000)\n"
        "    audio.writeframes(b'\\0\\0' * max(1, len(text) * 40))\n",
    )
    ffmpeg_log = root / "ffmpeg-arguments.json"
    fake_ffmpeg = root / "fake-ffmpeg"
    make_executable(
        fake_ffmpeg,
        "import json, os, shutil, sys, time\n"
        "arguments = sys.argv[1:]\n"
        "with open(os.environ['FAKE_FFMPEG_LOG'], 'a', encoding='utf-8') as log:\n"
        "    log.write(json.dumps(arguments) + '\\n')\n"
        "time.sleep(0.05)\n"
        "source = arguments[arguments.index('-i') + 1]\n"
        "if '-f' in arguments and arguments[arguments.index('-f') + 1] == 'opus':\n"
        "    open(arguments[-1], 'wb').write(b'OggS' + b'fake opus audio' * 8)\n"
        "else:\n"
        "    shutil.copyfile(source, arguments[-1])\n",
    )

    os.environ["PIPER_BIN"] = str(fake_piper)
    os.environ["FFMPEG_BIN"] = str(fake_ffmpeg)
    os.environ["FAKE_FFMPEG_LOG"] = str(ffmpeg_log)
    controller = BRIDGE.PiperController(voice_dir, cache_dir, 16)

    status = controller.status()
    assert status["available"] is True
    assert status["loudnorm"] == BRIDGE.LOUDNORM_FILTER
    assert status["audioCodec"] == "opus"
    assert status["audioBitrateKbps"] == 48

    first = controller.prepare(
        "The first normalized cached chunk.", None, "session_one", "opus"
    )
    assert first["cached"] is False
    assert first["sampleRate"] == 48_000
    assert first["speakerCount"] == 2
    assert first["audioFormat"] == "opus"
    assert first["mimeType"] == "audio/ogg"
    assert first["audioUrl"] == f"/api/piper/audio/{first['cacheId']}"
    cached_opus = cache_dir / f"{first['cacheId']}.opus"
    assert cached_opus.read_bytes().startswith(b"OggS")
    assert controller.audio_path(first["cacheId"]) == (cached_opus, "opus")
    cached = controller.prepare(
        "The first normalized cached chunk.", None, "session_one", "opus"
    )
    assert cached["cached"] is True
    assert cached["speakerCount"] == 2

    ffmpeg_arguments = json.loads(ffmpeg_log.read_text(encoding="utf-8").splitlines()[0])
    assert ffmpeg_arguments[ffmpeg_arguments.index("-af") + 1] == BRIDGE.LOUDNORM_FILTER
    assert ffmpeg_arguments[ffmpeg_arguments.index("-ar") + 1] == "48000"
    assert ffmpeg_arguments[ffmpeg_arguments.index("-c:a") + 1] == "libopus"
    assert ffmpeg_arguments[ffmpeg_arguments.index("-b:a") + 1] == "48k"

    wav_fallback = controller.prepare(
        "A compatibility fallback chunk.", None, "session_two", "wav"
    )
    assert wav_fallback["audioFormat"] == "wav"
    assert wav_fallback["mimeType"] == "audio/wav"
    cached_wav = cache_dir / f"{wav_fallback['cacheId']}.wav"
    assert cached_wav.read_bytes().startswith(b"RIFF")
    assert wav_fallback["cacheId"] != first["cacheId"]

    active_result: dict[str, object] = {}

    def generate_for_session() -> None:
        try:
            active_result["value"] = controller.prepare(
                "A session-scoped cancellation test.",
                None,
                "session_cancel",
                "opus",
            )
        except Exception as error:  # noqa: BLE001 - test captures the exact type below.
            active_result["error"] = error

    generation_thread = threading.Thread(target=generate_for_session)
    generation_thread.start()
    deadline = time.monotonic() + 2
    while "session_cancel" not in controller._generation_processes:
        assert time.monotonic() < deadline
        time.sleep(0.01)

    controller.stop("different_session")
    assert controller._generation_processes["session_cancel"].poll() is None
    controller.stop("session_cancel")
    generation_thread.join(timeout=2)
    assert not generation_thread.is_alive()
    assert isinstance(active_result.get("error"), BRIDGE.SpeechCancelled)

    queue_results: dict[str, object] = {}

    def generate_queue_job(name: str, text: str) -> None:
        try:
            queue_results[name] = controller.prepare(text, None, name, "opus")
        except Exception as error:  # noqa: BLE001 - test checks cancellation below.
            queue_results[f"{name}_error"] = error

    active_thread = threading.Thread(
        target=generate_queue_job,
        args=("queue_active", "The active fair queue request."),
    )
    waiting_thread = threading.Thread(
        target=generate_queue_job,
        args=("queue_waiting", "The waiting fair queue request."),
    )
    active_thread.start()
    deadline = time.monotonic() + 2
    while "queue_active" not in controller._generation_processes:
        assert time.monotonic() < deadline
        time.sleep(0.01)
    waiting_thread.start()
    deadline = time.monotonic() + 2
    while controller.status()["queued"] != 1:
        assert time.monotonic() < deadline
        time.sleep(0.01)
    controller.stop("queue_waiting")
    waiting_thread.join(timeout=2)
    active_thread.join(timeout=2)
    assert not waiting_thread.is_alive()
    assert not active_thread.is_alive()
    assert isinstance(queue_results.get("queue_waiting_error"), BRIDGE.SpeechCancelled)
    assert queue_results.get("queue_active")

    BRIDGE.SmoothReaderHandler.controller = controller
    server = BRIDGE.ThreadingHTTPServer(("127.0.0.1", 0), BRIDGE.SmoothReaderHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()
    try:
        base_url = f"http://127.0.0.1:{server.server_address[1]}"
        prepare_request = urllib.request.Request(
            base_url + "/api/piper/prepare",
            data=json.dumps({
                "text": "The first normalized cached chunk.",
                "voice": None,
                "sessionId": "session_http",
                "audioFormat": "opus",
            }).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(prepare_request, timeout=2) as response:
            prepared_payload = json.loads(response.read())
            assert prepared_payload["cached"] is True
            assert prepared_payload["audioFormat"] == "opus"

        stop_request = urllib.request.Request(
            base_url + "/api/piper/stop",
            data=json.dumps({"sessionId": "session_http"}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(stop_request, timeout=2) as response:
            assert json.loads(response.read())["ok"] is True

        request = urllib.request.Request(
            base_url + first["audioUrl"],
            headers={"Range": "bytes=0-43"},
        )
        with urllib.request.urlopen(request, timeout=2) as response:
            assert response.status == 206
            assert response.headers["Content-Type"] == "audio/ogg"
            assert response.headers["Content-Range"].startswith("bytes 0-43/")
            assert response.read().startswith(b"OggS")
        index_request = urllib.request.Request(
            base_url + "/",
            headers={"If-Modified-Since": "Wed, 31 Dec 2099 23:59:59 GMT"},
        )
        with urllib.request.urlopen(index_request, timeout=2) as response:
            assert response.status == 200
            assert response.headers["Cache-Control"] == "no-store"
            assert b"styles-v36.css" in response.read()
    finally:
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=2)

print("multiuser cancellation, cached Opus/WAV, loudnorm, and browser audio test passed")
