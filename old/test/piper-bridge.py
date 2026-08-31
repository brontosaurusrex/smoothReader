#!/usr/bin/env python3
"""Regression checks for cached Piper generation, FFmpeg loudnorm, and WAV serving."""

from __future__ import annotations

import importlib.util
import json
import os
import stat
import sys
import tempfile
import threading
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
        "time.sleep(0.05)\n"
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
        "open(os.environ['FAKE_FFMPEG_LOG'], 'w', encoding='utf-8').write(json.dumps(arguments))\n"
        "time.sleep(0.05)\n"
        "source = arguments[arguments.index('-i') + 1]\n"
        "shutil.copyfile(source, arguments[-1])\n",
    )

    os.environ["PIPER_BIN"] = str(fake_piper)
    os.environ["FFMPEG_BIN"] = str(fake_ffmpeg)
    os.environ["FAKE_FFMPEG_LOG"] = str(ffmpeg_log)
    controller = BRIDGE.PiperController(voice_dir, cache_dir, 16)

    status = controller.status()
    assert status["available"] is True
    assert status["loudnorm"] == BRIDGE.LOUDNORM_FILTER

    first = controller.prepare("The first normalized cached chunk.", None)
    assert first["cached"] is False
    assert first["sampleRate"] == 24_000
    assert first["audioUrl"] == f"/api/piper/audio/{first['cacheId']}"
    cached_wav = cache_dir / f"{first['cacheId']}.wav"
    assert cached_wav.read_bytes().startswith(b"RIFF")
    assert controller.audio_path(first["cacheId"]) == cached_wav
    assert controller.prepare("The first normalized cached chunk.", None)["cached"] is True

    ffmpeg_arguments = json.loads(ffmpeg_log.read_text(encoding="utf-8"))
    assert ffmpeg_arguments[ffmpeg_arguments.index("-af") + 1] == BRIDGE.LOUDNORM_FILTER
    assert ffmpeg_arguments[ffmpeg_arguments.index("-ar") + 1] == "24000"
    assert ffmpeg_arguments[ffmpeg_arguments.index("-c:a") + 1] == "pcm_s16le"

    BRIDGE.SmoothReaderHandler.controller = controller
    server = BRIDGE.ThreadingHTTPServer(("127.0.0.1", 0), BRIDGE.SmoothReaderHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()
    try:
        base_url = f"http://127.0.0.1:{server.server_address[1]}"
        request = urllib.request.Request(
            base_url + first["audioUrl"],
            headers={"Range": "bytes=0-43"},
        )
        with urllib.request.urlopen(request, timeout=2) as response:
            assert response.status == 206
            assert response.headers["Content-Type"] == "audio/wav"
            assert response.headers["Content-Range"].startswith("bytes 0-43/")
            assert response.read().startswith(b"RIFF")
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

print("uncached app shell, cached Piper WAV, loudnorm, and browser audio test passed")
