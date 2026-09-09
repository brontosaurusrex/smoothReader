# Smooth Reader

> This software was vibe coded through conversation, rapid experiments, and iterative testing.

A small, install-free EPUB reader built around one continuous, native-scrolling document. It runs in a browser on desktop and mobile; the optional local bridge adds Piper text-to-speech.

For a detailed explanation of the EPUB pipeline, browser storage, backup format,
scroll/reflow handling, and Piper architecture, see [ABOUTTECH.md](ABOUTTECH.md).

## Keyboard shortcuts

- `O` — open another EPUB
- `R` — reopen the most recent cached book from the home screen
- `Home` / `End` — beginning / end of the book
- `Page Up` / `Page Down` — move roughly one screen
- `V` — read aloud from the visible text; press again to stop
- `Escape` — stop speech
- `P` / `Shift+P` — next / previous palette
- `F` / `Shift+F` — next / previous font
- `[` / `]` — decrease / increase font size
- `{` / `}` — decrease / increase line height
- `-` / `+` — decrease / increase letter spacing
- `0` — reset letter spacing
- `Alt+1…0` — select a palette directly
- `Alt+Shift+1…0` — select a font directly
- `Alt+Shift+M` — select System Mono

Mouse wheel, trackpad, touch scrolling, and middle-click autoscroll remain native. Hold the right mouse button and drag anywhere on the reading page for drag scrolling.

## Run

There is no build step and no npm or Electron dependency.

```sh
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`, then drop or choose an EPUB. `make run` does the same thing.

The opening screen shows up to 12 recently opened books with sharp cover thumbnails generated from each EPUB at up to 600 × 900 px. EPUB files, reading positions, and preferences stay in that browser's local storage/IndexedDB. Browser Back returns from a book to the opening screen; Forward returns to the loaded book.

## Settings

The top-right hamburger opens all reader controls.

The home screen and settings drawer always use the bundled EnvyCodeR Nerd Font. Changing a book's font affects only its text, reading percentage, and Piper voice label.

Per book: font, font size, line height, letter spacing, text width, and Piper voice.

Global: palette, contrast, maximum speech chunk length, and spoken-text center offset.

`RESET THIS BOOK` and `RESET GLOBAL SETTINGS` keep cached EPUBs and reading positions. New books inherit the currently active reading typography before becoming independently configurable.

First-run defaults: Nord, Alegreya 36 px, 1.28 line height, +0.02 em letter spacing, about 44 characters per line, 0% contrast, random voice, a fixed 150-character minimum and adjustable 550-character maximum speech chunk, and centered spoken text.

All selectable fonts are self-hosted in `vendor/fonts`; the app makes no Google Fonts requests.

## Export and import

`EXPORT LIBRARY` and `IMPORT LIBRARY` are available only on the home screen. Export creates one ZIP containing:

- up to 12 cached EPUB files and their cover thumbnails
- the recent-books list
- the current and saved reading position for every remembered book
- per-book typography and Piper voice settings
- global palette, contrast, maximum chunk, and spoken-text offset settings

Import merges the backup into the current browser rather than clearing it. Duplicate books are matched by their content hash, existing cached data is preserved, and the newer timestamp wins when both sides contain a reading position. If the combined library exceeds 12 books, the 12 most recently opened remain in the accessible cache.

This backs up browser-side Smooth Reader data. It does not export generated audio from the server-side Piper cache.

## Piper text-to-speech

Run the included bridge instead of the basic server:

```sh
python3 piper_bridge.py
```

Then open `http://127.0.0.1:8000`. Piper and FFmpeg must be installed or supplied explicitly:

```sh
PIPER_BIN=/path/to/piper \
FFMPEG_BIN=/usr/bin/ffmpeg \
python3 piper_bridge.py \
  --voice-dir /path/to/voices \
  --cache-dir /path/to/audio-cache \
  --port 8000
```

The bridge searches the voice directory recursively for `.onnx` models and their `.onnx.json` files. It generates in the background, normalizes speech with FFmpeg, and serves mono Ogg Opus at 48 kbps when supported, with WAV fallback. Each browser tab has an isolated speech session; uncached Piper jobs share a fair single-generator queue.

Speech is planned from fully visible lines, advances after each batch, and continues in background tabs without a false off-screen error. Mobile operating systems may still suspend a browser under battery or memory pressure.

For an internet-facing Debian installation using systemd, Nginx, HTTPS, and password protection, see [SERVER-INSTALL.md](SERVER-INSTALL.md).

## Notes

- EPUB is currently the only supported book format.
- The complete EPUB spine is placed into one DOM document, so very large or image-heavy books use more memory.
- Chapter and fragment links inside an EPUB scroll to their target.
- EPUB contents are hashed, so renaming a file does not lose its position.
- Clearing browser site data removes cached books, positions, and settings.
- EPUB.js, JSZip, and fonts are bundled; ebook contents never leave the browser. With Piper enabled, only current text chunks are sent to the configured bridge.

## Verify

The checks require Node.js and Python; the reader itself does not.

```sh
make check
```
