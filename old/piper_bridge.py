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
import time
import wave
import zipfile
from collections import deque
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


APP_DIR = Path(__file__).resolve().parent
MAX_REQUEST_BYTES = 32_000
MAX_LIBRARY_STATE_BYTES = 512_000
MAX_LIBRARY_COVER_BYTES = 2 * 1024 * 1024
MAX_TEXT_LENGTH = 8_000
CACHE_FORMAT_VERSION = 4
LOUDNORM_FILTER = "loudnorm=I=-16:LRA=11:TP=-1.5"
OPUS_BITRATE_KBPS = 48
CACHE_ID_PATTERN = re.compile(r"^[a-f0-9]{64}$")
SESSION_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{8,128}$")
BOOK_HASH_PATTERN = re.compile(r"^[a-f0-9]{64}$")
LIBRARY_BOOK_ROUTE = re.compile(
    r"^/api/library/books/([a-f0-9]{64})(?:/(epub|state|cover))?$"
)


class SpeechCancelled(RuntimeError):
    """Raised when one browser session cancels its queued or active speech job."""


class LibraryUserRequired(PermissionError):
    """Raised when an authenticated Nginx username is required but missing."""


class LibraryController:
    """Small per-user, file-backed EPUB and reading-state store."""

    def __init__(
        self,
        library_dir: Path,
        max_book_mb: int,
        require_user: bool,
    ) -> None:
        self.library_dir = library_dir.expanduser().resolve()
        self.library_dir.mkdir(parents=True, exist_ok=True)
        self.max_book_bytes = max(1, max_book_mb) * 1024 * 1024
        self.require_user = require_user
        self._lock = threading.RLock()

    def _username(self, forwarded_user: str | None) -> str:
        username = str(forwarded_user or "").strip()
        if not username:
            if self.require_user:
                raise LibraryUserRequired("Authenticated library user was not provided")
            return "local"
        if len(username) > 256 or any(ord(character) < 32 for character in username):
            raise ValueError("Invalid library user")
        return username

    def _user_directory(self, forwarded_user: str | None) -> tuple[str, Path]:
        username = self._username(forwarded_user)
        user_key = hashlib.sha256(username.encode("utf-8")).hexdigest()
        return username, self.library_dir / user_key

    def _book_directory(self, forwarded_user: str | None, book_hash: str) -> Path:
        if not BOOK_HASH_PATTERN.fullmatch(book_hash):
            raise ValueError("Invalid book identifier")
        _, user_directory = self._user_directory(forwarded_user)
        return user_directory / book_hash

    @staticmethod
    def _read_json(path: Path) -> dict[str, Any]:
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            return {}
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError("Stored book state is invalid") from error
        return value if isinstance(value, dict) else {}

    @staticmethod
    def _timestamp(value: Any) -> int:
        if isinstance(value, bool):
            return 0
        try:
            return max(0, int(value))
        except (TypeError, ValueError, OverflowError):
            return 0

    @staticmethod
    def _limited_text(value: Any, maximum: int) -> str:
        return str(value or "").strip()[:maximum]

    @staticmethod
    def _write_json_atomic(path: Path, value: dict[str, Any]) -> None:
        temporary = path.with_name(
            f".{path.name}.{threading.get_ident()}.{random.randrange(1 << 30)}.tmp"
        )
        try:
            temporary.write_text(
                json.dumps(value, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)

    def status(self, forwarded_user: str | None) -> dict[str, Any]:
        username, _ = self._user_directory(forwarded_user)
        return {
            "ok": True,
            "available": True,
            "user": username,
            "bookCount": len(self.list_books(forwarded_user)),
            "maxBookBytes": self.max_book_bytes,
        }

    def list_books(self, forwarded_user: str | None) -> list[dict[str, Any]]:
        _, user_directory = self._user_directory(forwarded_user)
        if not user_directory.is_dir():
            return []
        records = []
        with self._lock:
            for book_directory in user_directory.iterdir():
                if (
                    not book_directory.is_dir()
                    or not BOOK_HASH_PATTERN.fullmatch(book_directory.name)
                    or not (book_directory / "book.epub").is_file()
                ):
                    continue
                state = self._read_json(book_directory / "state.json")
                position = state.get("position") if isinstance(state.get("position"), dict) else {}
                opened_at = self._timestamp(state.get("openedAt"))
                saved_at = self._timestamp(position.get("savedAt"))
                updated_at = self._timestamp(state.get("updatedAt"))
                records.append({
                    "hash": book_directory.name,
                    "fileName": self._limited_text(state.get("fileName"), 512)
                    or f"{book_directory.name[:12]}.epub",
                    "title": self._limited_text(state.get("title"), 1024),
                    "openedAt": opened_at,
                    "updatedAt": max(updated_at, saved_at, opened_at),
                    "coverUrl": (
                        f"/api/library/books/{book_directory.name}/cover"
                        if (book_directory / "cover.jpg").is_file()
                        else ""
                    ),
                    "serverStored": True,
                })
        return sorted(
            records,
            key=lambda record: (record["updatedAt"], record["openedAt"]),
            reverse=True,
        )

    def read_state(self, forwarded_user: str | None, book_hash: str) -> dict[str, Any]:
        book_directory = self._book_directory(forwarded_user, book_hash)
        if not (book_directory / "book.epub").is_file():
            raise FileNotFoundError("Server book was not found")
        with self._lock:
            state = self._read_json(book_directory / "state.json")
        return {"ok": True, "state": state}

    def write_state(
        self,
        forwarded_user: str | None,
        book_hash: str,
        incoming: dict[str, Any],
    ) -> dict[str, Any]:
        book_directory = self._book_directory(forwarded_user, book_hash)
        if not (book_directory / "book.epub").is_file():
            raise FileNotFoundError("Upload the EPUB before its reading state")

        incoming_position = incoming.get("position")
        if not isinstance(incoming_position, dict):
            incoming_position = {}
        incoming_settings = incoming.get("settings")
        if not isinstance(incoming_settings, dict):
            incoming_settings = {}

        with self._lock:
            existing = self._read_json(book_directory / "state.json")
            existing_position = existing.get("position")
            if not isinstance(existing_position, dict):
                existing_position = {}
            existing_settings = existing.get("settings")
            if not isinstance(existing_settings, dict):
                existing_settings = {}

            position = (
                incoming_position
                if self._timestamp(incoming_position.get("savedAt"))
                >= self._timestamp(existing_position.get("savedAt"))
                else existing_position
            )
            settings = (
                incoming_settings
                if self._timestamp(incoming_settings.get("savedAt"))
                >= self._timestamp(existing_settings.get("savedAt"))
                else existing_settings
            )
            state = {
                "version": 1,
                "hash": book_hash,
                "fileName": self._limited_text(
                    incoming.get("fileName") or existing.get("fileName"), 512
                ) or f"{book_hash[:12]}.epub",
                "title": self._limited_text(
                    incoming.get("title") or existing.get("title"), 1024
                ),
                "openedAt": max(
                    self._timestamp(incoming.get("openedAt")),
                    self._timestamp(existing.get("openedAt")),
                ),
                "position": position,
                "settings": settings,
                "updatedAt": int(time.time() * 1000),
            }
            self._write_json_atomic(book_directory / "state.json", state)
        return {"ok": True, "state": state}

    @staticmethod
    def _validate_epub(path: Path) -> None:
        try:
            with zipfile.ZipFile(path) as archive:
                names = set(archive.namelist())
                if "META-INF/container.xml" not in names:
                    raise ValueError("EPUB is missing META-INF/container.xml")
                bad_entry = archive.testzip()
                if bad_entry:
                    raise ValueError(f"EPUB contains a damaged entry: {bad_entry}")
        except zipfile.BadZipFile as error:
            raise ValueError("EPUB is not a valid ZIP archive") from error

    def write_epub(
        self,
        forwarded_user: str | None,
        book_hash: str,
        source: Any,
        content_length: int,
    ) -> dict[str, Any]:
        if content_length <= 0 or content_length > self.max_book_bytes:
            raise ValueError(
                f"EPUB size must be between 1 byte and {self.max_book_bytes} bytes"
            )
        book_directory = self._book_directory(forwarded_user, book_hash)
        book_directory.mkdir(parents=True, exist_ok=True)
        temporary = book_directory / (
            f".book.{threading.get_ident()}.{random.randrange(1 << 30)}.tmp"
        )
        digest = hashlib.sha256()
        remaining = content_length
        try:
            with temporary.open("wb") as output:
                while remaining:
                    block = source.read(min(64 * 1024, remaining))
                    if not block:
                        raise ValueError("EPUB upload ended before the declared size")
                    output.write(block)
                    digest.update(block)
                    remaining -= len(block)
            if digest.hexdigest() != book_hash:
                raise ValueError("EPUB content does not match its book identifier")
            self._validate_epub(temporary)
            with self._lock:
                temporary.replace(book_directory / "book.epub")
        finally:
            temporary.unlink(missing_ok=True)
        return {"ok": True, "hash": book_hash, "size": content_length}

    def write_cover(
        self,
        forwarded_user: str | None,
        book_hash: str,
        source: Any,
        content_length: int,
    ) -> dict[str, Any]:
        if content_length <= 0 or content_length > MAX_LIBRARY_COVER_BYTES:
            raise ValueError("Cover must be a JPEG no larger than 2 MiB")
        book_directory = self._book_directory(forwarded_user, book_hash)
        if not (book_directory / "book.epub").is_file():
            raise FileNotFoundError("Upload the EPUB before its cover")
        cover = source.read(content_length)
        if len(cover) != content_length or not cover.startswith(b"\xff\xd8"):
            raise ValueError("Cover must be a valid JPEG image")
        temporary = book_directory / (
            f".cover.{threading.get_ident()}.{random.randrange(1 << 30)}.tmp"
        )
        try:
            temporary.write_bytes(cover)
            with self._lock:
                temporary.replace(book_directory / "cover.jpg")
        finally:
            temporary.unlink(missing_ok=True)
        return {"ok": True}

    def file_path(
        self,
        forwarded_user: str | None,
        book_hash: str,
        resource: str,
    ) -> tuple[Path, str]:
        book_directory = self._book_directory(forwarded_user, book_hash)
        if resource == "epub":
            path, content_type = book_directory / "book.epub", "application/epub+zip"
        elif resource == "cover":
            path, content_type = book_directory / "cover.jpg", "image/jpeg"
        else:
            raise ValueError("Invalid server book resource")
        if not path.is_file():
            raise FileNotFoundError("Server book resource was not found")
        return path, content_type

    def remove_book(self, forwarded_user: str | None, book_hash: str) -> None:
        book_directory = self._book_directory(forwarded_user, book_hash)
        if not book_directory.is_dir():
            raise FileNotFoundError("Server book was not found")
        with self._lock:
            for name in ("book.epub", "cover.jpg", "state.json"):
                (book_directory / name).unlink(missing_ok=True)
            for temporary in book_directory.glob(".*.tmp"):
                temporary.unlink(missing_ok=True)
            try:
                book_directory.rmdir()
            except OSError:
                pass


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
        return sorted(
            self.voice_dir.rglob("*.onnx"),
            key=lambda path: self._voice_id(path).lower(),
        )

    def _voice_id(self, model: Path) -> str:
        return model.relative_to(self.voice_dir).as_posix()

    def status(self) -> dict[str, Any]:
        voices = self.voices()
        voice_details = []
        for voice in voices:
            speaker_count, _, speaker_names = self._voice_metadata(voice)
            voice_details.append({
                "id": self._voice_id(voice),
                "speakerCount": speaker_count,
                "speakerNames": speaker_names,
            })
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
            "voices": [self._voice_id(voice) for voice in voices],
            "voiceDetails": voice_details,
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
            requested_id = requested.replace("\\", "/")
            match = next(
                (voice for voice in voices if self._voice_id(voice) == requested_id),
                None,
            )
            if not match:
                legacy_matches = [
                    voice for voice in voices if voice.name == Path(requested_id).name
                ]
                match = legacy_matches[0] if len(legacy_matches) == 1 else None
            if not match:
                raise RuntimeError("The selected Piper voice is no longer available")
            return match
        seed = int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest()[:8], "big")
        return voices[seed % len(voices)]

    @staticmethod
    def _voice_metadata(model: Path) -> tuple[int, int, dict[str, str]]:
        config_path = Path(f"{model}.json")
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return 1, 22_050, {}
        try:
            speakers = max(1, int(config.get("num_speakers", 1) or 1))
        except (TypeError, ValueError):
            speakers = 1
        try:
            sample_rate = int(
                config.get("audio", {}).get("sample_rate", 22_050) or 22_050
            )
        except (AttributeError, TypeError, ValueError):
            sample_rate = 22_050

        speaker_names: dict[str, str] = {}
        raw_speaker_map = config.get("speaker_id_map", {})
        if isinstance(raw_speaker_map, dict):
            for name, speaker_id in raw_speaker_map.items():
                try:
                    numeric_id = int(speaker_id)
                except (TypeError, ValueError):
                    continue
                if 0 <= numeric_id < speakers and str(name).strip():
                    speaker_names.setdefault(str(numeric_id), str(name).strip())
        return speakers, max(1, sample_rate), speaker_names

    @classmethod
    def _voice_config(cls, model: Path) -> tuple[int, int]:
        speaker_count, sample_rate, _ = cls._voice_metadata(model)
        return speaker_count, sample_rate

    def _speaker_for_text(self, text: str, model: Path, speaker_count: int) -> int:
        digest = hashlib.sha256(
            f"{self._voice_id(model)}\0{text}".encode("utf-8")
        ).digest()
        return int.from_bytes(digest[:8], "big") % speaker_count

    def _select_speaker(
        self,
        requested: Any,
        text: str,
        model: Path,
        speaker_count: int,
    ) -> int:
        if requested is None or requested == "":
            return self._speaker_for_text(text, model, speaker_count)
        if isinstance(requested, bool):
            raise ValueError("Invalid Piper speaker ID")
        try:
            speaker = int(requested)
        except (TypeError, ValueError) as error:
            raise ValueError("Invalid Piper speaker ID") from error
        if str(requested).strip() != str(speaker) or not 0 <= speaker < speaker_count:
            raise ValueError(
                f"Piper speaker ID must be between 0 and {speaker_count - 1}"
            )
        return speaker

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
            model_identity = [
                self._voice_id(model),
                model_stat.st_size,
                model_stat.st_mtime_ns,
            ]
        except OSError:
            model_identity = [self._voice_id(model), 0, 0]
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
        requested_speaker: Any = None,
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
        speaker = self._select_speaker(
            requested_speaker, text, model, speaker_count
        )
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
                    "voice": self._voice_id(model),
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
    library: LibraryController

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

    def _read_payload(self, maximum_bytes: int = MAX_REQUEST_BYTES) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > maximum_bytes:
            raise ValueError("Invalid request size")
        payload = json.loads(self.rfile.read(length))
        if not isinstance(payload, dict):
            raise ValueError("JSON request must be an object")
        return payload

    def _library_user(self) -> str | None:
        return self.headers.get("X-Smooth-Reader-User")

    def _content_length(self) -> int:
        try:
            return int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid request size") from error

    def _send_private_file(self, path: Path, content_type: str) -> None:
        file_size = path.stat().st_size
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Cache-Control", "private, no-store")
        self.end_headers()
        try:
            with path.open("rb") as source:
                while True:
                    block = source.read(64 * 1024)
                    if not block:
                        break
                    self.wfile.write(block)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _library_error(self, error: Exception) -> None:
        if isinstance(error, LibraryUserRequired):
            status = HTTPStatus.UNAUTHORIZED
        elif isinstance(error, FileNotFoundError):
            status = HTTPStatus.NOT_FOUND
        elif isinstance(error, (ValueError, json.JSONDecodeError)):
            status = HTTPStatus.BAD_REQUEST
        else:
            self.log_error("Server library error: %s", error)
            status = HTTPStatus.INTERNAL_SERVER_ERROR
        self._json_response(status, {"ok": False, "error": str(error)})

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
        if request_path in ("/api/library/status", "/api/library/books"):
            try:
                if request_path == "/api/library/status":
                    payload = self.library.status(self._library_user())
                else:
                    payload = {
                        "ok": True,
                        "books": self.library.list_books(self._library_user()),
                    }
                self._json_response(HTTPStatus.OK, payload)
            except Exception as error:  # noqa: BLE001 - translated to a bounded API error.
                self._library_error(error)
            return

        library_match = LIBRARY_BOOK_ROUTE.fullmatch(request_path)
        if library_match and library_match.group(2) in ("epub", "state", "cover"):
            try:
                book_hash, resource = library_match.groups()
                if resource == "state":
                    self._json_response(
                        HTTPStatus.OK,
                        self.library.read_state(self._library_user(), book_hash),
                    )
                else:
                    path, content_type = self.library.file_path(
                        self._library_user(), book_hash, resource
                    )
                    self._send_private_file(path, content_type)
            except Exception as error:  # noqa: BLE001 - translated to a bounded API error.
                self._library_error(error)
            return

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
                    payload.get("speaker"),
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

    def do_PUT(self) -> None:  # noqa: N802
        request_path = self.path.split("?", 1)[0]
        library_match = LIBRARY_BOOK_ROUTE.fullmatch(request_path)
        if not library_match or library_match.group(2) not in ("epub", "state", "cover"):
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
            return
        try:
            book_hash, resource = library_match.groups()
            if resource == "epub":
                payload = self.library.write_epub(
                    self._library_user(),
                    book_hash,
                    self.rfile,
                    self._content_length(),
                )
            elif resource == "cover":
                payload = self.library.write_cover(
                    self._library_user(),
                    book_hash,
                    self.rfile,
                    self._content_length(),
                )
            else:
                payload = self.library.write_state(
                    self._library_user(),
                    book_hash,
                    self._read_payload(MAX_LIBRARY_STATE_BYTES),
                )
            self._json_response(HTTPStatus.OK, payload)
        except Exception as error:  # noqa: BLE001 - translated to a bounded API error.
            self._library_error(error)

    def do_DELETE(self) -> None:  # noqa: N802
        request_path = self.path.split("?", 1)[0]
        library_match = LIBRARY_BOOK_ROUTE.fullmatch(request_path)
        if not library_match or library_match.group(2) is not None:
            self._json_response(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
            return
        try:
            self.library.remove_book(self._library_user(), library_match.group(1))
            self._json_response(HTTPStatus.OK, {"ok": True})
        except Exception as error:  # noqa: BLE001 - translated to a bounded API error.
            self._library_error(error)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument(
        "--voice-dir",
        type=Path,
        default=Path(os.environ.get("PIPER_VOICE_DIR", "~/piper")),
        help="root directory recursively containing Piper .onnx and .onnx.json files",
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
    parser.add_argument(
        "--library-dir",
        type=Path,
        default=Path(os.environ.get(
            "SMOOTH_READER_LIBRARY_DIR",
            "~/.local/share/smooth-reader/library",
        )),
        help="persistent root for per-user server EPUB libraries",
    )
    parser.add_argument(
        "--library-max-book-mb",
        type=int,
        default=256,
        help="maximum uploaded EPUB size in MiB (default: 256)",
    )
    parser.add_argument(
        "--require-library-user",
        action="store_true",
        default=os.environ.get("SMOOTH_READER_REQUIRE_LIBRARY_USER", "").lower()
        in ("1", "true", "yes", "on"),
        help="require X-Smooth-Reader-User from an authenticated reverse proxy",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    SmoothReaderHandler.controller = PiperController(
        args.voice_dir,
        args.cache_dir,
        args.cache_max_mb,
    )
    SmoothReaderHandler.library = LibraryController(
        args.library_dir,
        args.library_max_book_mb,
        args.require_library_user,
    )
    server = ThreadingHTTPServer(("127.0.0.1", args.port), SmoothReaderHandler)
    print(f"Smooth Reader: http://127.0.0.1:{args.port}")
    status = SmoothReaderHandler.controller.status()
    print(status["error"] or f"Piper ready with {len(status['voices'])} voice(s)")
    print(f"Audio cache: {status['cacheDirectory']}")
    print(f"Server library: {SmoothReaderHandler.library.library_dir}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        SmoothReaderHandler.controller.stop_all()
        server.server_close()


if __name__ == "__main__":
    main()
