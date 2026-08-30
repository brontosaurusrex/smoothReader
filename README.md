# Smooth Reader — web edition

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
connects the same web reader to Piper and mpv.

Click the drop surface to choose a file.
All keyboard shortcuts and mouse scrolling controls are listed unobtrusively on
that initial screen. Open, reopen, palette, font, letter-spacing, and text-width
controls on that screen are also clickable.
The opening screen uses the selected book font and scales gently with the book
font-size setting, with readable minimum and maximum interface sizes.

The initial drop screen shows up to three left-aligned recently opened books at
the same width as the help panel. Each title is
clickable and immediately opens its locally cached EPUB at its remembered
position. Press `R` or click the `R` help row to reopen the newest one. Entries
whose cached data was cleared remain visible but disabled until dropped again.

While reading, move to the faint `MENU` tab in the top-left corner to open the
mouse settings panel. It provides palette and font selectors, letter spacing,
font size, line height, approximate characters per line, page navigation, a
`HOME` button back to the recent-books screen, and open/reopen actions.
A small bottom-right number shows the current reading percentage.

Font, font-size, line-height, letter-spacing, and text-width changes preserve an
exact text anchor near the upper-middle of the viewport. The document can
reflow, but the sentence you were reading should remain in the same place.

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
Hyperlegible, Crimson Pro, Alegreya, EB Garamond, Merriweather, System Mono. The
nine named web families are loaded through the Google Fonts CSS API; System Mono
uses the best locally installed monospace font. Font and letter-spacing choices
are remembered.

Book font size and line height are separate from browser zoom. Browser zoom
scales the entire app, while these two settings reflow only the book text and
leave the menu, progress indicator, and other interface elements unchanged.
Font size ranges from 14 to 36 pixels; line height ranges from 1.20 to 2.20.

## Local Piper speech

The hidden reading menu contains a Piper voice selector, `READ FROM HERE`, and
`STOP`. If text is selected, only that selection is read. Otherwise reading
starts at the first text block near the upper-middle of the viewport and
continues through the rest of the book. Text is normalized and split on
punctuation into chunks of about 550 characters, following the supplied
`piperread` script's useful behavior. Random voice selection is the default;
choosing a specific installed model keeps that voice.

The bridge listens only on `127.0.0.1`. By default it looks for `.onnx` and
`.onnx.json` voice files in `~/piper`, selects a random speaker when a model has
more than one, reads the model sample rate, and streams Piper's raw audio to
mpv. Override the voice directory or binaries when needed:

```sh
python3 piper_bridge.py --voice-dir /path/to/voices --port 8000
PIPER_BIN=/path/to/piper MPV_BIN=/path/to/mpv python3 piper_bridge.py
```

Install or provide `piper` and `mpv`; no npm packages are involved. On WSL2,
opening the printed localhost URL in the Windows browser normally reaches the
loopback server forwarded by WSL.

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
- no bookshelf, chapter list, notes, or accounts; reading settings stay in the
  compact hidden menu
- the complete EPUB spine is placed into one DOM document
- no pointer lock or wheel interception; right-button drag is the only mouse gesture
- links inside the EPUB scroll to their matching chapter or fragment
- position identified by the EPUB contents, so renaming the file does not lose it
- all reading data remains on the computer

Because the whole book is loaded at once, very large or image-heavy EPUBs use
more memory than a paginated reader.

The app files carry versioned names (`renderer-v19.js` and `styles-v19.css`) so a
GitHub Pages deployment cannot combine this renderer with an older cached layout.

EPUB.js and JSZip are included directly in `vendor/`. Only Google Fonts CSS and
font files are requested externally; the EPUB itself never leaves the browser.
Up to three recently opened EPUBs can be cached in IndexedDB on this browser so
their titles can reopen them directly; clearing site data removes those cached
copies and saved reading positions.

## Verify the source

The optional source checks require Node.js but the reader itself does not:

```sh
make check
```
