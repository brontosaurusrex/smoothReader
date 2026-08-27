# Smooth Reader — web edition

A dependency-free local webpage for reading EPUBs as one continuously scrolling
document. Drop an EPUB into the page; its position is stored locally and restored
when that EPUB is dropped again.

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

Click the drop surface or press `Ctrl+O` to choose a file.

## Reading controls

- Mouse wheel: normal scrolling
- `Ctrl` + mouse wheel: change text size
- `Ctrl` + `+` / `-`: change text size
- `Ctrl` + `0`: reset text size
- Left click: lock the pointer; vertical mouse movement scrolls
- Left click again or `Esc`: release the pointer
- Hold the right mouse button and drag: grab-scroll the page

## Current scope

- EPUB only
- no bookshelf, chapter list, settings, notes, or accounts
- continuous Chromium-native scrolling
- position identified by the EPUB contents, so renaming the file does not lose it
- all reading data remains on the computer

EPUB.js and JSZip are included directly in `vendor/`; the page makes no network
requests and the EPUB never leaves the browser.

## Verify the source

The optional source checks require Node.js but the reader itself does not:

```sh
make check
```
