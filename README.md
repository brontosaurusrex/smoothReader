![slopware warning](https://brontosaurusrex.github.io/media/slopware02.svg)


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

Click the drop surface to choose a file.
All keyboard shortcuts and mouse scrolling controls are listed unobtrusively on
that initial screen.

The initial drop screen shows the title and filename of the last successfully
opened book. Press `R` to reopen its cached copy without selecting it again.

## Reading controls

- `O`: open another EPUB with the system file selector
- `R`: reopen the last book from the browser's local cache
- Mouse wheel, trackpad, and middle-click autoscroll: native browser behavior
- Hold the right mouse button and move anywhere on the reading page: scroll in
  the direction of the mouse movement; release to stop
- `Home` / `End`: beginning / end of the book
- `Page Up` / `Page Down`: smooth movement by roughly one screen
- `Ctrl` + mouse wheel or `Ctrl` + `+` / `-`: native browser zoom
- `+` / `-`: increase / decrease letter spacing
- `0`: reset letter spacing to the comfortable default
- `P` / `Shift+P`: next / previous color palette
- `Alt+1` through `Alt+9`, or `Alt+0`: select a palette directly
- `F` / `Shift+F`: next / previous reading font
- `Alt+Shift+1` through `Alt+Shift+9`, or `Alt+Shift+0`: select a font directly
- `Alt+Shift+M`: select System Mono directly

Palette order: Charcoal, Geany, Midnight, Sepia, Forest, Paper, Nord, Solarized
Dark, Gruvbox, Plum. Geany is based on the supplied screenshot's `#333d4d`
background and muted teal-green accents. The palette choice is remembered, and
there is no persistent settings GUI.

Font order: System Sans, Noto Serif, Literata, Source Serif 4, Lora, Atkinson
Hyperlegible, Crimson Pro, Alegreya, EB Garamond, Merriweather, System Mono. The
nine named web families are loaded through the Google Fonts CSS API; System Mono
uses the best locally installed monospace font. Font and letter-spacing choices
are remembered.

## Current scope

- EPUB only
- no bookshelf, chapter list, settings, notes, or accounts
- the complete EPUB spine is placed into one DOM document
- no pointer lock or wheel interception; right-button drag is the only mouse gesture
- links inside the EPUB scroll to their matching chapter or fragment
- position identified by the EPUB contents, so renaming the file does not lose it
- all reading data remains on the computer

Because the whole book is loaded at once, very large or image-heavy EPUBs use
more memory than a paginated reader.

The app files carry versioned names (`renderer-v13.js` and `styles-v13.css`) so a
GitHub Pages deployment cannot combine this renderer with an older cached layout.

EPUB.js and JSZip are included directly in `vendor/`. Only Google Fonts CSS and
font files are requested externally; the EPUB itself never leaves the browser.
The last opened EPUB can be cached in IndexedDB on this browser so `R` can reopen
it; clearing site data removes that cached copy and saved reading positions.

## Verify the source

The optional source checks require Node.js but the reader itself does not:

```sh
make check
```
