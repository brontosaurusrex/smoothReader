# Smooth Reader — web edition

> Smooth Reader was vibe-coded: shaped through conversation, rapid
> experimentation, and a great deal of iterative testing.

A dependency-free local webpage that loads an EPUB's entire reading order into
one ordinary scrolling document. Drop an EPUB into the page; its position is
stored locally and restored when that EPUB is dropped again.

## Run it

From this directory, run:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Or simply use `make run`. There is no installation, npm command, Electron
runtime, or build step. The folder itself is the finished web app.

For local Piper text-to-speech, use the included loopback server instead:

```sh
python3 piper_bridge.py
```

Then open `http://127.0.0.1:8000`. The ordinary GitHub Pages version cannot
launch a local executable; the bridge is the deliberately small local part that
connects the same web reader to Piper and FFmpeg.

For a complete internet-facing Debian deployment with systemd, Nginx, HTTPS,
password protection, and Piper voices, see
[SERVER-INSTALL.md](SERVER-INSTALL.md).

Click the drop surface to choose a file.
All keyboard shortcuts and mouse scrolling controls are listed unobtrusively on
that initial screen. Open, reopen, palette, contrast, font, letter-spacing, and text-width
controls on that screen are also clickable.
The opening screen uses the selected book font and scales gently with the book
font-size setting, with readable minimum and maximum interface sizes. It is a
normal vertically scrolling page rather than a fixed, vertically centred
overlay, so its heading and controls remain reachable at high browser zoom.
Dropping an EPUB anywhere on it still opens the book.

The initial drop screen shows up to three left-aligned recently opened books at
the same width as the help panel. Each title is
clickable and immediately opens its locally cached EPUB at its remembered
position. Press `R` or click the `R` help row to reopen the newest one. Entries
whose cached data was cleared remain visible but disabled until dropped again.

While reading, use the faint hamburger button in the top-right corner to open
the mouse/touch settings panel. It provides palette, contrast, and font selectors, letter spacing,
font size, line height, approximate characters per line, page navigation, a
`HOME` button back to the recent-books screen, and open/reopen actions.
A phone-sized or coarse-pointer display makes the hamburger fully visible and
larger, while the start screen and settings drawer use phone-sized type and
48-pixel-or-larger touch targets. Font size also has dedicated minus/plus buttons, and all
sliders use full-width touch targets so they remain adjustable inside the
scrolling mobile drawer.
A small bottom-right stack shows playback controls while speech is active,
followed by reading percentage, chunk progress, and the active voice name.

Font, font-size, line-height, letter spacing, text width, and Piper voice are
remembered per book. Palette, contrast, speech chunk limits, and spoken-line position are
global. Contrast ranges from `-30%` (softer) through `0%` (the palette's exact
colors) to `+30%` (stronger). A newly opened book inherits the current reading settings. Changes preserve an
exact text anchor near the upper-middle of the viewport. The document can
reflow, but the sentence you were reading should remain in the same place.
Repeated `R` presses and recent-book clicks are locked while an EPUB is loading,
fonts and images are settling, and its saved position is being restored.

## Reading controls

- `O`: open another EPUB with the system file selector
- `R`: reopen the newest book from the browser's local cache
- `V`: start local Piper speech at selected text, or at the text currently in view;
  press it again or press `Escape` to stop
- Mouse wheel, trackpad, and middle-click autoscroll: native browser behavior
- Hold the right mouse button and move anywhere on the reading page: scroll in
  the direction of the mouse movement; release to stop
- `Home` / `End`: beginning / end of the book
- `Page Up` / `Page Down`: smooth movement by roughly one screen
- `Ctrl` + mouse wheel or `Ctrl` + `+` / `-`: native browser zoom
- `[` / `]`: decrease / increase book font size
- `{` / `}`: decrease / increase book line height
- `+` / `-`: increase / decrease letter spacing
- `0`: reset letter spacing to the comfortable default
- `P` / `Shift+P`: next / previous color palette
- `Alt+1` through `Alt+9`, or `Alt+0`: select a palette directly
- `F` / `Shift+F`: next / previous reading font
- `Alt+Shift+1` through `Alt+Shift+9`, or `Alt+Shift+0`: select a font directly
- `Alt+Shift+M`: select System Mono directly

Palette order: Charcoal, Geany, Midnight, Sepia, Forest, Paper, Nord, Solarized
Dark, Gruvbox, Plum. Geany is based on the supplied screenshot's `#333d4d`
background and muted teal-green accents. The palette choice is remembered and
is available from both the keyboard and mouse settings.

Font order: System Sans, Noto Serif, Literata, Source Serif 4, Lora, Atkinson
Hyperlegible, Crimson Pro, Alegreya, EB Garamond, Merriweather, Envy Code R Nerd
Font, System Mono. All nine Google Fonts families and Envy Code R are self-hosted
in `vendor/fonts`; the reader makes no requests to Google Fonts. Regular, bold,
italic, and bold-italic faces are included for every Google family. Envy Code R
uses the original Nerd Fonts v3.5.1 regular TTF, while System Mono uses the best
locally installed monospace font. The bundled `*-OFL.txt` and
`EnvyCodeR-LICENCE.md` files contain their licenses. Font and letter-spacing
choices are remembered.

Book font size and line height are separate from browser zoom. Browser zoom
scales the entire app, while these two settings reflow only the book text and
leave the menu, progress indicator, and other interface elements unchanged.
Font size ranges from 14 to 80 pixels in two-pixel steps; line height ranges
from 1.20 to 2.20.

On a first run with no saved preferences, the defaults are Nord, `0%` contrast,
Alegreya, 36 px text, 1.28 line height, +0.02 em letter spacing, approximately 44
characters per line, random voice, 150–350 character speech chunks, and a 22%
spoken-line position.

## Local Piper speech

The reading menu contains a Piper voice selector, remembered minimum and
maximum chunk controls, `READ FROM HERE`, `PAUSE` / `CONTINUE`, and `STOP`. If
text is selected, only that selection is read. Otherwise reading
starts at the first text block near the upper-middle of the viewport and
continues through the rest of the book. Text is normalized and split near the
configured limit. Between the minimum and maximum, the reader prefers the last
strong stop (`.`, `!`, or `?`), then the last softer pause (`,`, `;`, or `:`),
then a whole-word boundary. Only an unbroken word longer than the limit is cut
exactly at the maximum, so the maximum is always a strict character limit. Text
from adjacent short EPUB paragraphs is accumulated before
splitting, preventing tiny audio files that can produce Piper or loudnorm
artifacts. The defaults are 150–350 characters; minimum can be set from 100–500
and maximum from 300–1200. A final remainder may be shorter than the configured
minimum because it is never merged in a way that would exceed the maximum. If
the total selected text is too short to meet the minimum, one shorter chunk is
unavoidable. Random voice selection is the default;
choosing a specific installed model keeps that voice.

Piper generates a temporary WAV, then FFmpeg applies `loudnorm` once and stores
mono Ogg Opus at 48 kbps in a persistent cache. Browsers that cannot play Ogg
Opus automatically request a normalized PCM WAV fallback instead. Only the
requested format is generated, so normal Opus clients do not also consume WAV
cache space. While the browser
plays that cached chunk, the bridge generates and normalizes the next chunk in
a separate request. Playback therefore stays one prepared chunk ahead whenever
Piper is fast enough. Repeated text with the same model and speaker reuses its
cached audio without running Piper or FFmpeg again. Random selection is stable
per text chunk so those cache hits remain possible.

Immediately before each cached chunk plays, the reader maps that chunk back to
its original DOM text nodes. A slim vertical marker appears just left of that
range instead of selecting and recoloring a large block of text. Its horizontal
position is anchored just outside the containing text block, even when reading
begins in the middle of a paragraph or on an indented line. Each new chunk uses
a near-immediate 5 ms transition to move its actual first rendered line—not
merely its paragraph—to the upper reading area, so long paragraphs follow
correctly. This visual animation runs independently and never delays audio
playback. The marker is
recalculated after browser zoom, font changes, width changes, and other text
reflow, and is cleared when reading stops. Exact ranges and fallback block
mapping both place the spoken text at a remembered height in the viewport. The
menu's `Spoken line position` slider ranges from 5–50% and defaults to 22% from
the top. The existing 5 ms TTS follow transition is intentionally unchanged.

The bridge listens only on `127.0.0.1`. By default it looks for `.onnx` and
`.onnx.json` voice files in `~/piper`, selects among available speakers when a
model has more than one, and reads the model sample rate. Piper writes proper
WAV files with an embedded format and sample-rate header; the bridge validates
that header, runs FFmpeg's `loudnorm` filter (`I=-16`, `LRA=11`, `TP=-1.5`), and
encodes the requested cached format. The browser's native audio element plays
those files and handles pause/continue locally, preserving the exact playback
position. No mpv process or IPC socket is used. The active voice name includes
its zero-based internal speaker ID (for example, `model-name/3`) only when the
ONNX model contains multiple speakers. Single-speaker models show only their
voice name. A small `current/total` chunk counter appears beneath the bottom-right reading
percentage, with the longer voice name on the lowest line. Play/pause and stop
buttons appear above these values while Piper is active. Normal generation and
playback show no central Piper overlay; actual Piper errors still appear there.

Each browser tab has a session identifier. Cache hits and audio downloads can
run concurrently, while uncached Piper jobs use a fair shared queue and one
generator at a time to avoid overloading a small server. Pause remains local to
the browser. Stop cancels only that tab's active or queued generation and cannot
terminate another user's Piper process. This provides isolated concurrent TTS
sessions; it does not provide cloud accounts or cross-device book syncing.
Override the voice directory, cache, or binaries when needed:

```sh
python3 piper_bridge.py --voice-dir /path/to/voices --port 8000
python3 piper_bridge.py --cache-dir /path/to/cache --cache-max-mb 2048
PIPER_BIN=/path/to/piper FFMPEG_BIN=/path/to/ffmpeg python3 piper_bridge.py
```

Install or provide `piper` and `ffmpeg`; mpv and npm are not required. On WSL2,
opening the printed localhost URL in the Windows browser normally reaches the
loopback server forwarded by WSL.

The default cache is `~/.cache/smooth-reader-piper` and is pruned least-recently
used above 1024 MiB. At 48 kbps, Opus uses about 21.6 MB per hour of speech.

Text width is measured in `ch` units and can be set from approximately 40 to 100
characters per line. It is an estimate because proportional fonts have letters
of different widths. The selected width is remembered.

## Possible next formats

Plain text (`.txt`) and standalone HTML (`.html`) would be trivial additions.
Markdown (`.md`) would need a small parser, while FictionBook (`.fb2`) is also a
good fit because it is XML. PDF can be displayed but would not share this
reader's reflowing-text behavior. MOBI and AZW would require substantially more
parsing code and are not simple browser additions.

## Current scope

- EPUB only
- no bookshelf, chapter list, notes, or application accounts; reading settings stay in the
  compact hidden menu
- the complete EPUB spine is placed into one DOM document
- no pointer lock or wheel interception; right-button drag is the only mouse gesture
- links inside the EPUB scroll to their matching chapter or fragment
- position identified by the EPUB contents, so renaming the file does not lose it
- EPUB bytes and positions stay in the browser; when Piper is used, only the
  current text chunks are sent to the configured bridge and cached there as audio

Because the whole book is loaded at once, very large or image-heavy EPUBs use
more memory than a paginated reader.

The app files carry versioned names (`renderer-v36.js` and `styles-v36.css`) so a
GitHub Pages deployment cannot combine this renderer with an older cached layout.
The local bridge also serves the HTML, JavaScript, and CSS with `no-store` while
retaining long-lived caching for generated Opus or compatibility WAV audio.

EPUB.js, JSZip, and every selectable web font are included directly in
`vendor/`. Smooth Reader makes no external font requests, and the EPUB itself
never leaves the browser.
Up to three recently opened EPUBs can be cached in IndexedDB on this browser so
their titles can reopen them directly; clearing site data removes those cached
copies and saved reading positions.

The layout is touch-friendly: the opening screen uses the platform file picker,
the settings panel becomes a right-side drawer on narrow screens, controls use
44 px touch targets, native touch scrolling remains enabled, and fixed controls
respect mobile safe-area insets. Pinch zoom is not disabled.

## Verify the source

The optional source checks require Node.js but the reader itself does not:

```sh
make check
```
