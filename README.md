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

## Reading controls

- Mouse wheel, trackpad, and middle-click autoscroll: native browser behavior
- `Home` / `End`: beginning / end of the book
- `Page Up` / `Page Down`: smooth movement by roughly one screen
- `Ctrl` + mouse wheel or `Ctrl` + `+` / `-`: native browser zoom
- `P` / `Shift+P`: next / previous color palette
- `Alt+1` through `Alt+6`: select a palette directly

Palette order: Charcoal, Geany, Midnight, Sepia, Forest, Paper. Geany is based
on the supplied screenshot's `#333d4d` background and muted teal-green accents.
The palette choice is remembered, and there is no persistent settings GUI.

## Current scope

- EPUB only
- no bookshelf, chapter list, settings, notes, or accounts
- the complete EPUB spine is placed into one DOM document
- no pointer lock, mouse gestures, wheel interception, or custom scrolling code
- links inside the EPUB scroll to their matching chapter or fragment
- position identified by the EPUB contents, so renaming the file does not lose it
- all reading data remains on the computer

Because the whole book is loaded at once, very large or image-heavy EPUBs use
more memory than a paginated reader.

The app files carry versioned names (`renderer-v7.js` and `styles-v7.css`) so a
GitHub Pages deployment cannot combine this renderer with an older cached layout.

EPUB.js and JSZip are included directly in `vendor/`; the page makes no network
requests and the EPUB never leaves the browser.

## Verify the source

The optional source checks require Node.js but the reader itself does not:

```sh
make check
```
