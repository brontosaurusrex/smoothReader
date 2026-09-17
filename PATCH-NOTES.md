# Smooth Reader — 2026-09-17 reliability + Pocket Mode patch

## Fixed

- TTS no longer carries a precomputed future pixel scroll offset across reflow.
  The next normal reading viewport is recalculated from the logical text cursor
  only after the previous batch has finished.
- Font, font-size, line-height, text-width, zoom, rotation and mobile visual
  viewport changes therefore cannot make TTS jump to a stale planned screen.
- Speech geometry now uses `visualViewport` when available.
- Reading-position fallback now prefers character/proportional position before
  legacy absolute `scrollY`.
- Server state sync now has a separate pending timer per book.
- Loading stored per-book settings no longer changes their `savedAt` timestamp.
- Library import now keeps newer per-book settings as well as newer positions.
- Page hide/unload flushes all pending per-book server-state writes.


## Local position persistence / DOM fix

- Position capture no longer relies solely on `caretPositionFromPoint` /
  `caretRangeFromPoint`. If browser hit-testing cannot identify a visible text
  node, the reader now scans the visible rendered DOM with `TreeWalker` and
  `Range.getClientRects()` and saves the resulting chapter/text offset.
- Hidden/background lifecycle saves no longer recalculate text geometry from a
  potentially frozen mobile DOM. They reuse the newest snapshot captured while
  the page was definitely visible.
- A cheap scroll snapshot is recorded immediately while scrolling, so a phone
  that freezes/kills the tab before the 180 ms full-anchor save still has a
  current proportional fallback instead of an old DOM anchor.
- Reopening no longer waits indefinitely for every image in the entire EPUB.
  For a saved DOM anchor, only images in chapters at or before that anchor are
  layout-critical; unfinished relevant images are switched from lazy to eager
  and the wait is capped at 4 seconds. This fixes EPUBs where an off-screen
  `loading="lazy"` image could otherwise leave restore stuck at the top.

## Pocket Mode

- New per-book **POCKET MODE** setting.
- Uses logical text progression rather than viewport progression.
- Uses speech chunks up to about 5,000 characters with about 24,000 characters
  queued as a logical batch, reducing browser wakeups/source changes.
- While hidden, Pocket Mode does not depend on scrolling or viewport geometry.
- Adds Media Session metadata and play/pause/stop handlers when supported.
- Requests the browser `audioSession` `playback` type when available.
- Returning to a visible page re-centres on the logical speech position.

Pocket Mode improves locked/background playback but a mobile OS may still
suspend a browser under aggressive battery or memory pressure.

## Server deployment

`SERVER-INSTALL.md` now provisions `/var/lib/smooth-reader/library`, grants it
through the hardened systemd `ReadWritePaths`, starts the bridge with
`--library-dir` and `--require-library-user`, and forwards Nginx Basic Auth's
`$remote_user` as `X-Smooth-Reader-User`.

## Deployment

Replace the matching files in `/opt/smooth-reader/app/` and restart the bridge:

```bash
sudo cp index.html renderer-v36.js styles-v36-mobile7.css piper_bridge.py SERVER-INSTALL.md /opt/smooth-reader/app/
sudo systemctl restart smooth-reader
```

If enabling the server-library changes from the revised install guide, also
update the systemd unit and Nginx configuration as documented there, then run:

```bash
sudo systemctl daemon-reload
sudo nginx -t
sudo systemctl restart smooth-reader
sudo systemctl reload nginx
```

## Scroll regression fix

- Removed the `visualViewport.scroll -> handleViewportResize` binding. It treated ordinary document scrolling as a viewport resize and the resize-anchor code corrected wheel/PageUp/PageDown movement back to the previous position, effectively locking scrolling.
- Kept `visualViewport.resize` handling for real mobile viewport-size changes.
- Bumped the renderer cache key in `index.html` so browsers do not reuse the broken script.

## UI regression fixes

- Restored home-page storage-state cover borders: **white = server stored**, **black = client only**.
- Restored approximate page count on its own line above the reading percentage.
- Styled the fullscreen control so it no longer appears as a browser-default black rounded rectangle.
- Bumped the stylesheet cache key in `index.html`.


## Speech continuity + restored UI sizing

- Restored safe next-chunk look-ahead: the first logical chunk after a viewport batch is prepared while the current audio is still playing. Only logical text/audio is queued; no future pixel offset or viewport geometry is retained.
- Restored page counter to **1rem** above the existing **1.50rem** percentage.
- Restored server/client cover state frames to **3px**: white = server stored, black = client only.
- Home fullscreen control is kept inside the dashed drop-zone frame rather than overlapping it.

## Console debug logging

No debug UI was added. DevTools `console.debug()` now reports:

- Piper prepare start/done/failure with chunk length, duration, cache hit and format;
- audio prefetch duration/bytes and failures;
- playback request/start/end with startup time, inter-chunk gap and prefetch state;
- logical look-ahead queue/reuse;
- reading-position save/restore method and offsets;
- visibility and visual-viewport resize events.

Filter the console for `SmoothReader`, `TTS`, or `POSITION`.
