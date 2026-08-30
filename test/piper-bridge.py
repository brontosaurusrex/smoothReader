#!/usr/bin/env python3
"""Regression checks for cached generation, overlap, loudnorm, and pause."""

from __future__ import annotations

import importlib.util
import json
import os
import stat
import sys
import tempfile
import threading
import time
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
        "time.sleep(0.15)\n"
        "output_path = sys.argv[sys.argv.index('--output_file') + 1]\n"
        "with wave.open(output_path, 'wb') as audio:\n"
        "    audio.setnchannels(1)\n"
        "    audio.setsampwidth(2)\n"
        "    audio.setframerate(24000)\n"
        "    audio.writeframes(b'\\0\\0' * max(1, len(text) * 40))\n",
    )
    mpv_log = root / "mpv-arguments.json"
    fake_mpv = root / "fake-mpv"
    make_executable(
        fake_mpv,
        "import json, os, sys, time\n"
        "open(os.environ['FAKE_MPV_LOG'], 'w', encoding='utf-8').write(json.dumps(sys.argv[1:]))\n"
        "time.sleep(0.4)\n",
    )

    os.environ["PIPER_BIN"] = str(fake_piper)
    os.environ["MPV_BIN"] = str(fake_mpv)
    os.environ["FAKE_MPV_LOG"] = str(mpv_log)
    controller = BRIDGE.PiperController(voice_dir, cache_dir, 16)

    first = controller.prepare("The first cached chunk.", None)
    assert first["cached"] is False
    assert first["sampleRate"] == 24_000
    assert (cache_dir / f"{first['cacheId']}.wav").read_bytes().startswith(b"RIFF")
    assert controller.prepare("The first cached chunk.", None)["cached"] is True

    playback_errors: list[Exception] = []

    def play_first() -> None:
        try:
            controller.play(first["cacheId"])
        except Exception as error:  # pragma: no cover - surfaced by assertion below
            playback_errors.append(error)

    playback_thread = threading.Thread(target=play_first)
    playback_thread.start()
    for _ in range(100):
        if controller.status()["active"]:
            break
        time.sleep(0.01)
    assert controller.set_paused(True) == {"ok": True, "active": True, "paused": True}

    second = controller.prepare("The next chunk is generated in the background.", None)
    assert second["cached"] is False
    assert playback_thread.is_alive(), "generation should finish while cached audio is still playing"
    assert controller.set_paused(False) == {"ok": True, "active": True, "paused": False}
    playback_thread.join(timeout=2)
    assert not playback_thread.is_alive()
    assert not playback_errors
    assert controller.prepare("The next chunk is generated in the background.", None)["cached"] is True

    mpv_arguments = json.loads(mpv_log.read_text(encoding="utf-8"))
    assert f"--af={BRIDGE.LOUDNORM_FILTER}" in mpv_arguments
    assert not any(argument.startswith("--demuxer=rawaudio") for argument in mpv_arguments)
    assert not any(argument.startswith("--demuxer-rawaudio-") for argument in mpv_arguments)
    assert mpv_arguments[-1].endswith(".wav")

print("cached Piper WAV pipeline, loudnorm, and pause test passed")
