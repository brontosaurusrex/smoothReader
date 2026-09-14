# Smooth Reader

> This software was vibe coded through conversation, rapid experiments, and iterative testing.

A small, install-free EPUB reader built around one continuous, native-scrolling document. It runs in a browser on desktop and mobile; the optional bridge adds Piper text-to-speech and private cross-device libraries.

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
- `Alt+1…0` — select one of the first ten palettes directly
- `Alt+Shift+1…0` — select a font directly
- `Alt+Shift+M` — select System Mono

Mouse wheel, trackpad, touch scrolling, and middle-click autoscroll remain native. Hold the right mouse button and drag anywhere on the reading page for drag scrolling.

## Run

There is no build step and no npm or Electron dependency.

```sh
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`, then drop or choose an EPUB. `make run` does the same thing.

The opening screen shows the browser's 12 most recently cached books plus every
book available in the server library. Sharp cover thumbnails are generated from
each EPUB at up to 600 × 900 px. Browser Back returns from a book to the opening
screen; Forward returns to the loaded book.

Each home-screen cover shows `Title (Author - Year)` when all three EPUB metadata
fields are available. Publication years stored as either `dc:date` or EPUB 3
`meta property="dcterms:date"` are supported; the OPF modification timestamp is
never treated as the publication year. If the OPF date is absent or an invalid
placeholder, likely copyright and publication pages are checked for an
explicitly labelled year. If anything is still missing, the filename is shown
instead, with the saved percentage
and, once the book has been indexed by this version, an approximate page such
as `(34%, 34/233)` on the line beneath it. In the reader, the simulated page is
shown above the bottom-right percentage.
One simulated page equals 2,000 normalized text characters, including ordinary
single spaces; images do not add pages.

`MANAGE LIBRARY` on the opening screen lets you select one or more books.
`REMOVE FROM THIS DEVICE` deletes their local EPUBs, thumbnails, positions, and
per-book settings. When the server library is available, it also provides
`STORE ON SERVER` and `REMOVE FROM SERVER`. Cover outlines identify whether a
book is server-backed or client-only.

The browser keeps at most 12 EPUB files locally. Opening another book evicts the
least-recently opened local cache entry. A server-backed book remains visible
with its server cover and downloads into the browser cache again when clicked.
A white cover outline denotes server storage; a same-width black outline denotes
a client-only book. Only `REMOVE FROM SERVER` deletes the server copy.

## Settings

The top-right hamburger opens all reader controls. The subtle fullscreen button
in the bottom-right control stack sits above play/pause and changes to an
exit-fullscreen icon while active. Browsers that do not expose the Fullscreen
API do not show it.

The home screen and settings drawer always use the bundled EnvyCodeR Nerd Font. Changing a book's font affects only its text, reading percentage, and Piper voice label.

Every reader control is stored per book: palette, contrast, font, font size,
line height, letter spacing, text width, Piper voice and embedded speaker ID,
maximum speech chunk length, and spoken-text center offset.
Speech playback speed is also stored per book and can be adjusted from −33% to
+33% without regenerating cached audio.

Each palette entry previews five colours: page background, main text, muted
text, lines/borders, and headings.

`RESET THIS BOOK` restores those controls only for the open book. It keeps the
cached EPUB and reading position. A newly added book always starts with the
first-run defaults, then becomes independently configurable. The home screen
always uses Nord with neutral contrast.

First-run defaults: Nord, Alegreya 36 px, 1.28 line height, +0.02 em letter spacing, about 44 characters per line, 0% contrast, random voice and speaker ID, a fixed 150-character minimum and adjustable 550-character maximum speech chunk, centered spoken text, and normal speech speed.

All selectable fonts are self-hosted in `vendor/fonts`; the app makes no Google Fonts requests.

## Export and import

`EXPORT LIBRARY` and `IMPORT LIBRARY` are available only on the home screen. Export creates one ZIP containing:

- up to 12 cached EPUB files and their cover thumbnails
- the recent-books list
- the current and saved reading position for every remembered book
- every per-book reader setting, including typography, appearance, and Piper controls

Import merges the backup into the current browser rather than clearing it. Duplicate books are matched by their content hash, existing cached data is preserved, and the newer timestamp wins when both sides contain a reading position. If the combined browser cache exceeds 12 books, the 12 most recently opened remain cached locally; server books remain listed separately.

This backs up browser-side Smooth Reader data. It does not export generated audio from the server-side Piper cache.

## Server library and cross-device reading

When Smooth Reader is served by `piper_bridge.py`, selected books can be stored
in a private server library. Each authenticated Nginx username gets an isolated
library. Sign in with the same username on another device and its server books
appear on the home screen; clicking one downloads, caches, and opens it.

After the initial EPUB upload, Smooth Reader synchronizes only the small
per-book state: reading position and every reader setting. Position records also
include a chapter/text anchor so restoration survives different viewport sizes
and text reflow better than a pixel offset alone. The first fully visible text
line becomes the saved bookmark. Newer timestamps win when two devices have
saved the same book. Simultaneously reading the same book on two devices is
therefore last-update-wins.

The existing ZIP export remains a backup of the current browser's local data.
Back up the server library directory separately as part of normal server
backups.

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
  --library-dir /path/to/server-library \
  --port 8000
```

The bridge searches the voice directory recursively for `.onnx` models and their `.onnx.json` files. It generates in the background, normalizes speech with FFmpeg, and serves mono Ogg Opus at 48 kbps when supported, with WAV fallback. While one chunk plays, the browser downloads the prepared next Opus chunk into temporary memory for a faster transition. Each browser tab has an isolated speech session; uncached Piper jobs share a fair single-generator queue.

After selecting a multi-speaker ONNX voice, an `Embedded voice` selector appears.
`RANDOM ID` keeps deterministic automatic speaker selection; selecting a numbered
ID fixes that speaker for every chunk of that book. Single-speaker models do not
show the extra selector. Names from `speaker_id_map` are shown when available.

Speech is planned from fully visible lines, advances after each batch, and continues in background tabs without a false off-screen error. Mobile operating systems may still suspend a browser under battery or memory pressure.

For an internet-facing Debian installation using systemd, Nginx, HTTPS, and password protection, see [SERVER-INSTALL.md](SERVER-INSTALL.md).

## Notes

- EPUB is currently the only supported book format.
- The complete EPUB spine is placed into one DOM document, so very large or image-heavy books use more memory.
- Chapter and fragment links inside an EPUB scroll to their target.
- EPUB contents are hashed, so renaming a file does not lose its position.
- Broken EPUB archives are rejected with a visible error; archive, package,
  opening, section, and metadata operations have bounded timeouts.
- Clearing browser site data removes cached books, positions, and settings.
- EPUB.js, JSZip, and fonts are bundled. Ebook contents remain in the browser
  unless the user explicitly chooses `STORE ON SERVER`. With Piper enabled,
  current text chunks are also sent to the configured bridge.

## Verify

The checks require Node.js and Python; the reader itself does not.

```sh
make check
```
