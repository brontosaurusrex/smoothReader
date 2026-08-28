"use strict";

const dropZone = document.querySelector("#drop-zone");
const reader = document.querySelector("#reader");
const viewer = document.querySelector("#viewer");
const dragCover = document.querySelector("#drag-cover");
const status = document.querySelector("#status");
const fileInput = document.querySelector("#file-input");

const POSITION_PREFIX = "smooth-reader:position:";
const FONT_SIZE_KEY = "smooth-reader:font-size";
const SAVE_DELAY_MS = 180;
const DEFAULT_FONT_SIZE = 20;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 38;
const FONT_SIZE_STEP = 2;
const LOCKED_SCROLL_SPEED = 2.05;
const SCROLL_RESPONSE = 0.18;
const SCROLL_STOP_THRESHOLD = 0.08;
const MAX_QUEUED_SCROLL = 1400;
const MAX_SCROLL_STEP = 180;
const WHEEL_LINE_PIXELS = 20;

let book = null;
let rendition = null;
let activeBookKey = null;
let lastLocation = null;
let saveTimer = null;
let loadGeneration = 0;
let dragDepth = 0;
let statusTimer = null;
let fontSize = Number(localStorage.getItem(FONT_SIZE_KEY)) || DEFAULT_FONT_SIZE;
let queuedScroll = 0;
let scrollFrame = null;
let previousFrameTime = 0;

fontSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, fontSize));

const showStatus = (message, hideAfter = 0) => {
  window.clearTimeout(statusTimer);
  status.textContent = message;
  status.hidden = false;

  if (hideAfter > 0) {
    statusTimer = window.setTimeout(clearStatus, hideAfter);
  }
};

const clearStatus = () => {
  window.clearTimeout(statusTimer);
  status.hidden = true;
  status.textContent = "";
};

const setReadingMode = (isReading) => {
  dropZone.hidden = isReading;
  reader.hidden = !isReading;
};

const positionKey = (hash) => `${POSITION_PREFIX}${hash}`;

const loadPosition = (hash) => {
  try {
    const stored = localStorage.getItem(positionKey(hash));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const savePositionNow = () => {
  if (!activeBookKey || !lastLocation?.start?.cfi) return;

  const record = {
    cfi: lastLocation.start.cfi,
    percentage: lastLocation.start.percentage ?? null,
    savedAt: Date.now()
  };

  localStorage.setItem(positionKey(activeBookKey), JSON.stringify(record));
};

const schedulePositionSave = () => {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(savePositionNow, SAVE_DELAY_MS);
};

const hashBook = async (arrayBuffer) => {
  const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const destroyCurrentBook = () => {
  window.clearTimeout(saveTimer);
  savePositionNow();
  lastLocation = null;
  queuedScroll = 0;
  previousFrameTime = 0;

  if (scrollFrame !== null) {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = null;
  }

  if (document.pointerLockElement === viewer) {
    document.exitPointerLock();
  }

  if (rendition) {
    rendition.destroy();
    rendition = null;
  }

  if (book) {
    book.destroy();
    book = null;
  }

  viewer.replaceChildren();
};

const applyReadingTheme = () => {
  rendition.themes.default({
    "html, body": {
      "background": "#121212 !important",
      "color": "#dedad1 !important"
    },
    "body": {
      "max-width": "48rem !important",
      "margin": "0 auto !important",
      "padding": "2.5rem clamp(1.4rem, 6vw, 4rem) !important",
      "font-family": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important",
      "font-size": "20px !important",
      "font-weight": "400 !important",
      "letter-spacing": "0.008em !important",
      "line-height": "1.72 !important",
      "overflow-x": "hidden !important"
    },
    "p": {
      "orphans": "2",
      "widows": "2"
    },
    "a": {
      "color": "#bcb6aa !important"
    },
    "img, svg": {
      "max-width": "100% !important",
      "height": "auto !important"
    }
  });

  rendition.themes.override("font-size", `${fontSize}px`, true);
};

const scrollReaderBy = (pixels) => {
  if (!rendition?.manager || !Number.isFinite(pixels)) return;
  rendition.manager.scrollBy(0, pixels, false);
};

const runSmoothScrollFrame = (timestamp) => {
  scrollFrame = null;

  if (!rendition || Math.abs(queuedScroll) <= SCROLL_STOP_THRESHOLD) {
    if (rendition && queuedScroll !== 0) scrollReaderBy(queuedScroll);
    queuedScroll = 0;
    previousFrameTime = 0;
    return;
  }

  const elapsed = previousFrameTime
    ? Math.min(50, Math.max(1, timestamp - previousFrameTime))
    : 1000 / 60;
  previousFrameTime = timestamp;

  const refreshAdjustedBlend = 1 - Math.pow(
    1 - SCROLL_RESPONSE,
    elapsed / (1000 / 60)
  );
  const step = Math.max(
    -MAX_SCROLL_STEP,
    Math.min(MAX_SCROLL_STEP, queuedScroll * refreshAdjustedBlend)
  );

  scrollReaderBy(step);
  queuedScroll -= step;
  scrollFrame = window.requestAnimationFrame(runSmoothScrollFrame);
};

const queueSmoothScroll = (pixels) => {
  if (!rendition || !Number.isFinite(pixels) || pixels === 0) return;

  // Direction changes respond immediately instead of consuming momentum
  // queued in the old direction first.
  if (queuedScroll !== 0 && Math.sign(pixels) !== Math.sign(queuedScroll)) {
    queuedScroll = 0;
    previousFrameTime = 0;
  }

  queuedScroll = Math.max(
    -MAX_QUEUED_SCROLL,
    Math.min(MAX_QUEUED_SCROLL, queuedScroll + pixels)
  );

  if (scrollFrame === null) {
    scrollFrame = window.requestAnimationFrame(runSmoothScrollFrame);
  }
};

const setFontSize = (nextSize, announce = true) => {
  const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, nextSize));
  if (clamped === fontSize) return;

  fontSize = clamped;
  localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  rendition?.themes?.override("font-size", `${fontSize}px`, true);

  if (announce) {
    const percentage = Math.round((fontSize / DEFAULT_FONT_SIZE) * 100);
    showStatus(`TEXT ${percentage}%`, 850);
  }
};

const adjustFontSize = (direction) => {
  setFontSize(fontSize + direction * FONT_SIZE_STEP);
};

const toggleMouseLock = () => {
  if (document.pointerLockElement === viewer) {
    document.exitPointerLock();
    return;
  }

  const request = viewer.requestPointerLock();
  if (request?.catch) {
    request.catch(() => {
      showStatus("Mouse lock was blocked.", 1400);
    });
  }
};

const handleReaderPointerDown = (event) => {
  if (!rendition) return;

  if (event.button === 0) {
    event.preventDefault();
    toggleMouseLock();
  }
};

const handleReaderClick = (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
};

const handleReaderWheel = (event) => {
  event.preventDefault();

  if (event.ctrlKey || event.metaKey) {
    adjustFontSize(event.deltaY < 0 ? 1 : -1);
    return;
  }

  const unit = event.deltaMode === 1
    ? WHEEL_LINE_PIXELS
    : event.deltaMode === 2
      ? window.innerHeight * 0.85
      : 1;
  queueSmoothScroll(event.deltaY * unit);
};

const jumpToBeginning = async () => {
  if (!rendition || !book) return;

  queuedScroll = 0;
  previousFrameTime = 0;
  if (scrollFrame !== null) {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = null;
  }

  try {
    const firstSection = book.spine?.first?.();
    await rendition.display(firstSection?.href || undefined);
    showStatus("START OF BOOK", 800);
  } catch (error) {
    console.error(error);
    showStatus("Could not jump to the start.", 1200);
  }
};

const handleReaderKeyDown = (event) => {
  const modifier = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (modifier && key === "o") {
    event.preventDefault();
    fileInput.click();
    return;
  }

  if (!modifier && key === "home") {
    event.preventDefault();
    jumpToBeginning();
    return;
  }

  if (!modifier) return;

  if (key === "+" || key === "=") {
    event.preventDefault();
    adjustFontSize(1);
  } else if (key === "-") {
    event.preventDefault();
    adjustFontSize(-1);
  } else if (key === "0") {
    event.preventDefault();
    setFontSize(DEFAULT_FONT_SIZE);
  }
};

const installReaderInputTarget = (target) => {
  target.addEventListener("pointerdown", handleReaderPointerDown, true);
  target.addEventListener("click", handleReaderClick, true);
  target.addEventListener("wheel", handleReaderWheel, { passive: false });
  target.addEventListener("keydown", handleReaderKeyDown, true);
};

const openBook = async (file) => {
  if (!file?.name?.toLowerCase().endsWith(".epub")) {
    showStatus("Please drop an EPUB file.");
    return;
  }

  const generation = ++loadGeneration;
  clearStatus();
  showStatus("Opening…");

  try {
    const bytes = await file.arrayBuffer();
    const hash = await hashBook(bytes);
    if (generation !== loadGeneration) return;

    destroyCurrentBook();
    activeBookKey = hash;
    const savedPosition = loadPosition(hash);

    book = ePub(bytes);
    await book.ready;
    if (generation !== loadGeneration) return;

    rendition = book.renderTo(viewer, {
      width: "100%",
      height: "100%",
      manager: "continuous",
      flow: "scrolled-continuous",
      spread: "none",
      allowScriptedContent: false
    });

    applyReadingTheme();

    rendition.on("relocated", (location) => {
      lastLocation = location;
      schedulePositionSave();
    });

    rendition.on("rendered", (_section, view) => {
      const contentDocument = view?.document;
      contentDocument?.documentElement?.setAttribute("data-smooth-reader", "true");
      if (contentDocument) {
        installDropTarget(contentDocument);
        installReaderInputTarget(contentDocument);
      }
    });

    setReadingMode(true);

    try {
      await rendition.display(savedPosition?.cfi || undefined);
    } catch {
      await rendition.display();
    }

    if (generation !== loadGeneration) return;
    showStatus("LEFT CLICK: MOUSE SCROLL · HOME: START · CTRL ±: TEXT", 2600);

    const metadata = await book.loaded.metadata;
    document.title = metadata?.title
      ? `${metadata.title} — Smooth Reader`
      : "Smooth Reader";
  } catch (error) {
    console.error(error);
    destroyCurrentBook();
    activeBookKey = null;
    setReadingMode(false);
    showStatus("That EPUB could not be opened.");
  }
};

const firstEpub = (fileList) =>
  [...fileList].find((file) => file.name.toLowerCase().endsWith(".epub"));

const openDroppedFiles = (fileList) => {
  const file = firstEpub(fileList);
  if (file) openBook(file);
  else showStatus("Please drop an EPUB file.");
};

dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files?.length) openDroppedFiles(fileInput.files);
  fileInput.value = "";
});

const handleDragEnter = (event) => {
  event.preventDefault();
  dragDepth += 1;
  document.body.classList.add("is-dragging");
  if (!reader.hidden) dragCover.hidden = false;
};

const handleDragOver = (event) => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
};

const handleDragLeave = (event) => {
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) {
    document.body.classList.remove("is-dragging");
    dragCover.hidden = true;
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  dragDepth = 0;
  document.body.classList.remove("is-dragging");
  dragCover.hidden = true;
  if (event.dataTransfer?.files?.length) openDroppedFiles(event.dataTransfer.files);
};

function installDropTarget(target) {
  target.addEventListener("dragenter", handleDragEnter);
  target.addEventListener("dragover", handleDragOver);
  target.addEventListener("dragleave", handleDragLeave);
  target.addEventListener("drop", handleDrop);
}

installDropTarget(window);
installReaderInputTarget(viewer);

window.addEventListener("keydown", handleReaderKeyDown);

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === viewer) {
    queueSmoothScroll(event.movementY * LOCKED_SCROLL_SPEED);
  }
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === viewer) {
    showStatus("MOUSE SCROLL · LEFT CLICK OR ESC TO RELEASE");
  } else if (rendition) {
    showStatus("MOUSE RELEASED", 700);
  }
});

window.addEventListener("beforeunload", savePositionNow);
