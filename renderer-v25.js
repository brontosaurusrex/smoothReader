"use strict";

const dropZone = document.querySelector("#drop-zone");
const reader = document.querySelector("#reader");
const viewer = document.querySelector("#viewer");
const dragCover = document.querySelector("#drag-cover");
const status = document.querySelector("#status");
const fileInput = document.querySelector("#file-input");
const recentBooks = document.querySelector("#recent-books");
const recentBookList = document.querySelector("#recent-book-list");
const dropPicker = document.querySelector("#drop-picker");
const startOpen = document.querySelector("#start-open");
const startReopen = document.querySelector("#start-reopen");
const startPaletteNext = document.querySelector("#start-palette-next");
const startPaletteSelect = document.querySelector("#start-palette");
const startFontNext = document.querySelector("#start-font-next");
const startFontSelect = document.querySelector("#start-font");
const startFontSize = document.querySelector("#start-font-size");
const startFontSizeValue = document.querySelector("#start-font-size-value");
const startLineHeight = document.querySelector("#start-line-height");
const startLineHeightValue = document.querySelector("#start-line-height-value");
const startTrackingDown = document.querySelector("#start-tracking-down");
const startTrackingReset = document.querySelector("#start-tracking-reset");
const startTrackingUp = document.querySelector("#start-tracking-up");
const startWidth = document.querySelector("#start-width");
const startWidthValue = document.querySelector("#start-width-value");
const settingsMenu = document.querySelector("#settings-menu");
const settingsToggle = document.querySelector("#settings-toggle");
const settingsPanel = document.querySelector("#settings-panel");
const settingsPaletteSelect = document.querySelector("#settings-palette");
const settingsFontSelect = document.querySelector("#settings-font");
const settingsFontSize = document.querySelector("#settings-font-size");
const settingsFontSizeValue = document.querySelector("#settings-font-size-value");
const settingsLineHeight = document.querySelector("#settings-line-height");
const settingsLineHeightValue = document.querySelector("#settings-line-height-value");
const settingsTrackingValue = document.querySelector("#settings-tracking-value");
const settingsTrackingDown = document.querySelector("#settings-tracking-down");
const settingsTrackingReset = document.querySelector("#settings-tracking-reset");
const settingsTrackingUp = document.querySelector("#settings-tracking-up");
const settingsWidth = document.querySelector("#settings-width");
const settingsWidthValue = document.querySelector("#settings-width-value");
const settingsSpeechVoice = document.querySelector("#settings-speech-voice");
const settingsSpeechMin = document.querySelector("#settings-speech-min");
const settingsSpeechMinValue = document.querySelector("#settings-speech-min-value");
const settingsSpeechMax = document.querySelector("#settings-speech-max");
const settingsSpeechMaxValue = document.querySelector("#settings-speech-max-value");
const settingsSpeechStart = document.querySelector("#settings-speech-start");
const settingsSpeechPause = document.querySelector("#settings-speech-pause");
const settingsSpeechStop = document.querySelector("#settings-speech-stop");
const settingsSpeechStatus = document.querySelector("#settings-speech-status");
const speechMarker = document.querySelector("#speech-marker");
const settingsHome = document.querySelector("#settings-home");
const settingsPageUp = document.querySelector("#settings-page-up");
const settingsPageDown = document.querySelector("#settings-page-down");
const settingsOpen = document.querySelector("#settings-open");
const settingsReopen = document.querySelector("#settings-reopen");
const readingProgress = document.querySelector("#reading-progress");

const POSITION_PREFIX = "smooth-reader:position:";
const PALETTE_KEY = "smooth-reader:palette";
const FONT_KEY = "smooth-reader:font";
const FONT_SIZE_KEY = "smooth-reader:font-size";
const LINE_HEIGHT_KEY = "smooth-reader:line-height";
const TRACKING_KEY = "smooth-reader:tracking";
const WIDTH_KEY = "smooth-reader:text-width";
const SPEECH_MIN_KEY = "smooth-reader:speech-minimum";
const SPEECH_MAX_KEY = "smooth-reader:speech-maximum";
const LAST_BOOK_KEY = "smooth-reader:last-book";
const RECENT_BOOKS_KEY = "smooth-reader:recent-books";
const LAST_BOOK_DB = "smooth-reader-library";
const LAST_BOOK_STORE = "books";
const LAST_BOOK_RECORD = "last-opened";
const RECENT_BOOKS_RECORD = "recent-books";
const MAX_RECENT_BOOKS = 3;
const SAVE_DELAY_MS = 180;
const PAGE_SCROLL_RATIO = 0.88;
const RIGHT_DRAG_SPEED = 1.35;
const DEFAULT_TRACKING_EM = 0.01;
const TRACKING_STEP_EM = 0.01;
const MIN_TRACKING_EM = -0.03;
const MAX_TRACKING_EM = 0.12;
const DEFAULT_WIDTH_CH = 72;
const MIN_WIDTH_CH = 40;
const MAX_WIDTH_CH = 100;
const DEFAULT_FONT_SIZE_PX = 20;
const MIN_FONT_SIZE_PX = 14;
const MAX_FONT_SIZE_PX = 36;
const FONT_SIZE_STEP_PX = 1;
const DEFAULT_LINE_HEIGHT = 1.72;
const MIN_LINE_HEIGHT = 1.2;
const MAX_LINE_HEIGHT = 2.2;
const LINE_HEIGHT_STEP = 0.04;
const DEFAULT_SPEECH_MIN_LENGTH = 350;
const DEFAULT_SPEECH_MAX_LENGTH = 550;
const MIN_SPEECH_MIN_LENGTH = 100;
const MAX_SPEECH_MIN_LENGTH = 500;
const MIN_SPEECH_MAX_LENGTH = 300;
const MAX_SPEECH_MAX_LENGTH = 1200;
const SPEECH_BLOCK_SELECTOR = "p, li, blockquote, h1, h2, h3, h4, h5, h6";
const PALETTES = [
  { id: "charcoal", name: "CHARCOAL" },
  { id: "geany", name: "GEANY" },
  { id: "midnight", name: "MIDNIGHT" },
  { id: "sepia", name: "SEPIA" },
  { id: "forest", name: "FOREST" },
  { id: "paper", name: "PAPER" },
  { id: "nord", name: "NORD" },
  { id: "solarized", name: "SOLARIZED DARK" },
  { id: "gruvbox", name: "GRUVBOX" },
  { id: "plum", name: "PLUM" }
];
const FONTS = [
  { id: "system-sans", name: "SYSTEM SANS" },
  { id: "noto-serif", name: "NOTO SERIF" },
  { id: "literata", name: "LITERATA" },
  { id: "source-serif", name: "SOURCE SERIF 4" },
  { id: "lora", name: "LORA" },
  { id: "atkinson", name: "ATKINSON HYPERLEGIBLE" },
  { id: "crimson-pro", name: "CRIMSON PRO" },
  { id: "alegreya", name: "ALEGREYA" },
  { id: "eb-garamond", name: "EB GARAMOND" },
  { id: "merriweather", name: "MERRIWEATHER" },
  { id: "system-mono", name: "SYSTEM MONO" }
];

let book = null;
let activeBookKey = null;
let saveTimer = null;
let statusTimer = null;
let loadGeneration = 0;
let dragDepth = 0;
let rightDrag = null;
let rightDragFrame = null;
let pendingRightDragScroll = 0;
let lastBookCanReopen = false;
let recentBookInfo = [];
let cachedRecentBooks = [];
let pendingLayoutAnchor = null;
let layoutChangeGeneration = 0;
let speechGeneration = 0;
let speechIsActive = false;
let speechIsPaused = false;
let speechActiveJob = null;
let speechActiveElements = [];
let speechMarkerFrame = null;
let speechTextMaps = new WeakMap();
const chapterLookup = new Map();
let paletteIndex = Math.max(
  0,
  PALETTES.findIndex((palette) => palette.id === localStorage.getItem(PALETTE_KEY))
);
let fontIndex = Math.max(
  0,
  FONTS.findIndex((font) => font.id === localStorage.getItem(FONT_KEY))
);
const savedTracking = Number.parseFloat(localStorage.getItem(TRACKING_KEY));
let trackingEm = Number.isFinite(savedTracking)
  ? Math.max(MIN_TRACKING_EM, Math.min(MAX_TRACKING_EM, savedTracking))
  : DEFAULT_TRACKING_EM;
const savedWidth = Number.parseInt(localStorage.getItem(WIDTH_KEY), 10);
let widthCh = Number.isFinite(savedWidth)
  ? Math.max(MIN_WIDTH_CH, Math.min(MAX_WIDTH_CH, savedWidth))
  : DEFAULT_WIDTH_CH;
const savedFontSize = Number.parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
let fontSizePx = Number.isFinite(savedFontSize)
  ? Math.max(MIN_FONT_SIZE_PX, Math.min(MAX_FONT_SIZE_PX, savedFontSize))
  : DEFAULT_FONT_SIZE_PX;
const savedLineHeight = Number.parseFloat(localStorage.getItem(LINE_HEIGHT_KEY));
let lineHeight = Number.isFinite(savedLineHeight)
  ? Math.max(MIN_LINE_HEIGHT, Math.min(MAX_LINE_HEIGHT, savedLineHeight))
  : DEFAULT_LINE_HEIGHT;
const savedSpeechMinimum = Number.parseInt(localStorage.getItem(SPEECH_MIN_KEY), 10);
const savedSpeechMaximum = Number.parseInt(localStorage.getItem(SPEECH_MAX_KEY), 10);
let speechMinimumLength = Number.isFinite(savedSpeechMinimum)
  ? Math.max(MIN_SPEECH_MIN_LENGTH, Math.min(MAX_SPEECH_MIN_LENGTH, savedSpeechMinimum))
  : DEFAULT_SPEECH_MIN_LENGTH;
let speechMaximumLength = Number.isFinite(savedSpeechMaximum)
  ? Math.max(MIN_SPEECH_MAX_LENGTH, Math.min(MAX_SPEECH_MAX_LENGTH, savedSpeechMaximum))
  : DEFAULT_SPEECH_MAX_LENGTH;
if (speechMinimumLength > speechMaximumLength) {
  speechMinimumLength = Math.min(DEFAULT_SPEECH_MIN_LENGTH, speechMaximumLength);
}

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

const setReopenAvailability = (canReopen) => {
  startReopen.disabled = !canReopen;
  settingsReopen.disabled = !canReopen;
};

const loadRecentBookInfo = () => {
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_BOOKS_KEY) || "null");
    if (Array.isArray(recent)) return recent.slice(0, MAX_RECENT_BOOKS);

    const legacy = JSON.parse(localStorage.getItem(LAST_BOOK_KEY) || "null");
    return legacy?.fileName ? [legacy] : [];
  } catch {
    return [];
  }
};

const booksMatch = (first, second) => {
  if (first?.hash && second?.hash) return first.hash === second.hash;
  return Boolean(first?.fileName && first.fileName === second?.fileName);
};

const renderRecentBooks = () => {
  recentBookList.replaceChildren();
  recentBooks.hidden = recentBookInfo.length === 0;

  recentBookInfo.forEach((record, index) => {
    const cached = cachedRecentBooks.find((candidate) => booksMatch(record, candidate));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-book";
    button.disabled = !cached?.bytes;
    button.textContent = record.title && record.title !== record.fileName
      ? `${record.title} — ${record.fileName}`
      : record.fileName;
    button.title = cached?.bytes
      ? `Open ${record.title || record.fileName}`
      : "Cached copy unavailable; drop this EPUB again";
    button.addEventListener("click", () => reopenCachedBook(record));
    recentBookList.appendChild(button);

    if (index === 0) {
      lastBookCanReopen = Boolean(cached?.bytes);
      setReopenAvailability(lastBookCanReopen);
    }
  });

  if (recentBookInfo.length === 0) {
    lastBookCanReopen = false;
    setReopenAvailability(false);
  }
};

const openLastBookDatabase = () => new Promise((resolve, reject) => {
  if (!window.indexedDB) {
    resolve(null);
    return;
  }

  const request = window.indexedDB.open(LAST_BOOK_DB, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(LAST_BOOK_STORE)) {
      request.result.createObjectStore(LAST_BOOK_STORE);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const readCacheRecord = async (recordKey) => {
  const database = await openLastBookDatabase();
  if (!database) return null;

  try {
    return await new Promise((resolve, reject) => {
      const request = database
        .transaction(LAST_BOOK_STORE, "readonly")
        .objectStore(LAST_BOOK_STORE)
        .get(recordKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
};

const writeCachedBooks = async (records) => {
  const database = await openLastBookDatabase();
  if (!database) return false;

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(LAST_BOOK_STORE, "readwrite");
      transaction.objectStore(LAST_BOOK_STORE).put(records, RECENT_BOOKS_RECORD);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return true;
  } finally {
    database.close();
  }
};

const readCachedBooks = async () => {
  const recent = await readCacheRecord(RECENT_BOOKS_RECORD);
  if (Array.isArray(recent)) return recent.slice(0, MAX_RECENT_BOOKS);

  const legacy = await readCacheRecord(LAST_BOOK_RECORD);
  return legacy?.fileName ? [legacy] : [];
};

const initializeRecentBooks = async () => {
  recentBookInfo = loadRecentBookInfo();
  renderRecentBooks();
  if (recentBookInfo.length === 0) return;

  try {
    cachedRecentBooks = await readCachedBooks();
    lastBookCanReopen = Boolean(
      cachedRecentBooks.find((cached) => booksMatch(recentBookInfo[0], cached))?.bytes
    );
    renderRecentBooks();
  } catch (error) {
    console.warn("Could not inspect the cached EPUBs.", error);
  }
};

initializeRecentBooks();

const populateSelect = (select, choices) => {
  choices.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.id;
    option.textContent = choice.name;
    select.appendChild(option);
  });
};

populateSelect(startPaletteSelect, PALETTES);
populateSelect(settingsPaletteSelect, PALETTES);
populateSelect(startFontSelect, FONTS);
populateSelect(settingsFontSelect, FONTS);

const getAnchorViewportTop = (anchor) => {
  if (!anchor) return null;

  if (anchor.element) {
    return anchor.element.getBoundingClientRect?.().top ?? null;
  }

  if (!anchor.node || !document.createRange) return null;
  try {
    const range = document.createRange();
    if (anchor.node.nodeType === 3) {
      const length = anchor.node.textContent?.length || 0;
      const start = Math.max(0, Math.min(anchor.offset, Math.max(0, length - 1)));
      range.setStart(anchor.node, start);
      range.setEnd(anchor.node, Math.min(length, start + 1));
    } else {
      const childCount = anchor.node.childNodes?.length || 0;
      range.setStart(anchor.node, Math.max(0, Math.min(anchor.offset, childCount)));
      range.collapse(true);
    }
    return range.getBoundingClientRect().top;
  } catch {
    return null;
  }
};

const captureLayoutAnchor = () => {
  if (reader.hidden || viewer.children.length === 0) return null;

  const x = window.innerWidth / 2;
  const y = Math.max(64, Math.min(window.innerHeight - 64, window.innerHeight * 0.32));
  const caret = document.caretPositionFromPoint?.(x, y);
  const legacyCaret = caret ? null : document.caretRangeFromPoint?.(x, y);
  const node = caret?.offsetNode || legacyCaret?.startContainer;
  const offset = caret?.offset ?? legacyCaret?.startOffset ?? 0;

  if (node) {
    const anchor = { node, offset };
    const viewportTop = getAnchorViewportTop(anchor);
    if (Number.isFinite(viewportTop)) return { ...anchor, viewportTop };
  }

  const element = document.elementFromPoint?.(x, y)?.closest?.(SPEECH_BLOCK_SELECTOR);
  if (element?.closest?.("#viewer")) {
    return { element, viewportTop: element.getBoundingClientRect().top };
  }
  return null;
};

const beginLayoutChange = () => {
  if (!pendingLayoutAnchor) pendingLayoutAnchor = captureLayoutAnchor();
  return pendingLayoutAnchor;
};

const scheduleLayoutAnchorRestore = (anchor) => {
  if (!anchor) return;
  const generation = ++layoutChangeGeneration;
  void viewer.offsetWidth;

  Promise.resolve(document.fonts?.ready)
    .catch(() => {})
    .then(() => new Promise((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
    }))
    .then(() => {
      if (generation !== layoutChangeGeneration || reader.hidden) return;
      pendingLayoutAnchor = null;
      const currentTop = getAnchorViewportTop(anchor);
      if (!Number.isFinite(currentTop)) return;
      const correction = currentTop - anchor.viewportTop;
      if (Math.abs(correction) > 0.5) {
        window.scrollBy({ top: correction, left: 0, behavior: "auto" });
      }
      scheduleSpeechMarkerRefresh();
      updateReadingProgress();
      schedulePositionSave();
    });
};

const syncSettingsControls = () => {
  const paletteId = PALETTES[paletteIndex].id;
  const fontId = FONTS[fontIndex].id;
  const trackingText = `${trackingEm > 0 ? "+" : ""}${trackingEm.toFixed(2)}em`;
  const widthText = `≈ ${widthCh} chars`;
  const fontSizeText = `${fontSizePx}px`;
  const lineHeightText = lineHeight.toFixed(2);

  startPaletteSelect.value = paletteId;
  settingsPaletteSelect.value = paletteId;
  startFontSelect.value = fontId;
  settingsFontSelect.value = fontId;
  settingsTrackingValue.textContent = trackingText;
  startWidth.value = String(widthCh);
  settingsWidth.value = String(widthCh);
  startWidthValue.textContent = widthText;
  settingsWidthValue.textContent = widthText;
  startFontSize.value = String(fontSizePx);
  settingsFontSize.value = String(fontSizePx);
  startFontSizeValue.textContent = fontSizeText;
  settingsFontSizeValue.textContent = fontSizeText;
  startLineHeight.value = String(lineHeight);
  settingsLineHeight.value = String(lineHeight);
  startLineHeightValue.textContent = lineHeightText;
  settingsLineHeightValue.textContent = lineHeightText;
};

const applyPalette = (nextIndex, announce = true) => {
  paletteIndex = (nextIndex + PALETTES.length) % PALETTES.length;
  const palette = PALETTES[paletteIndex];
  document.documentElement.dataset.palette = palette.id;
  localStorage.setItem(PALETTE_KEY, palette.id);
  syncSettingsControls();

  if (announce) {
    showStatus(`PALETTE ${paletteIndex + 1}/${PALETTES.length} · ${palette.name}`, 900);
  }
};

const applyFont = (nextIndex, announce = true) => {
  const anchor = beginLayoutChange();
  fontIndex = (nextIndex + FONTS.length) % FONTS.length;
  const font = FONTS[fontIndex];
  document.documentElement.dataset.font = font.id;
  localStorage.setItem(FONT_KEY, font.id);
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) {
    showStatus(`FONT ${fontIndex + 1}/${FONTS.length} · ${font.name}`, 900);
  }
};

const applyTracking = (nextTracking, announce = true) => {
  const anchor = beginLayoutChange();
  const clamped = Math.max(
    MIN_TRACKING_EM,
    Math.min(MAX_TRACKING_EM, nextTracking)
  );
  trackingEm = Math.round(clamped * 100) / 100;
  document.documentElement.style.setProperty(
    "--reader-tracking",
    `${trackingEm.toFixed(2)}em`
  );
  localStorage.setItem(TRACKING_KEY, String(trackingEm));
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) {
    const sign = trackingEm > 0 ? "+" : "";
    showStatus(`LETTER SPACING · ${sign}${trackingEm.toFixed(2)}em`, 900);
  }
};

const applyWidth = (nextWidth, announce = true) => {
  const anchor = beginLayoutChange();
  widthCh = Math.round(Math.max(MIN_WIDTH_CH, Math.min(MAX_WIDTH_CH, nextWidth)));
  document.documentElement.style.setProperty("--reader-width", `${widthCh}ch`);
  localStorage.setItem(WIDTH_KEY, String(widthCh));
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) {
    showStatus(`TEXT WIDTH · APPROX. ${widthCh} CHARACTERS`, 900);
  }
};

const applyFontSize = (nextSize, announce = true) => {
  const anchor = beginLayoutChange();
  fontSizePx = Math.round(
    Math.max(MIN_FONT_SIZE_PX, Math.min(MAX_FONT_SIZE_PX, nextSize))
  );
  document.documentElement.style.setProperty("--reader-font-size", `${fontSizePx}px`);
  localStorage.setItem(FONT_SIZE_KEY, String(fontSizePx));
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) showStatus(`FONT SIZE · ${fontSizePx}px`, 900);
};

const applyLineHeight = (nextLineHeight, announce = true) => {
  const anchor = beginLayoutChange();
  lineHeight = Math.round(
    Math.max(MIN_LINE_HEIGHT, Math.min(MAX_LINE_HEIGHT, nextLineHeight)) * 100
  ) / 100;
  document.documentElement.style.setProperty(
    "--reader-line-height",
    lineHeight.toFixed(2)
  );
  localStorage.setItem(LINE_HEIGHT_KEY, String(lineHeight));
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) showStatus(`LINE HEIGHT · ${lineHeight.toFixed(2)}`, 900);
};

applyPalette(paletteIndex, false);
applyFont(fontIndex, false);
applyTracking(trackingEm, false);
applyWidth(widthCh, false);
applyFontSize(fontSizePx, false);
applyLineHeight(lineHeight, false);

const setSettingsOpen = (isOpen) => {
  settingsPanel.hidden = !isOpen;
  settingsToggle.setAttribute("aria-expanded", String(isOpen));
};

const setReadingMode = (isReading) => {
  dropZone.hidden = isReading;
  reader.hidden = !isReading;
  settingsMenu.hidden = !isReading;
  readingProgress.hidden = !isReading;
  if (!isReading) setSettingsOpen(false);
};

const updateReadingProgress = () => {
  if (reader.hidden) return;
  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const percentage = scrollRange > 0
    ? Math.round((window.scrollY / scrollRange) * 100)
    : 0;
  readingProgress.textContent = `${Math.max(0, Math.min(100, percentage))}%`;
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
  if (!activeBookKey || reader.hidden) return;

  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

  localStorage.setItem(positionKey(activeBookKey), JSON.stringify({
    scrollY: window.scrollY,
    ratio: scrollRange > 0 ? window.scrollY / scrollRange : 0,
    savedAt: Date.now()
  }));
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
  stopRightDrag();
  layoutChangeGeneration += 1;
  pendingLayoutAnchor = null;
  if (speechIsActive) stopSpeech();

  if (book) {
    book.destroy();
    book = null;
  }

  viewer.replaceChildren();
  speechTextMaps = new WeakMap();
  chapterLookup.clear();
  window.scrollTo(0, 0);
};

const normalizeBookPath = (path) => {
  let decoded = String(path || "").replaceAll("\\", "/");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original path when an EPUB contains malformed escaping.
  }

  const parts = [];
  decoded.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") parts.pop();
    else parts.push(part);
  });
  return parts.join("/");
};

const resolveBookPath = (basePath, relativePath) => {
  if (relativePath.startsWith("/")) return normalizeBookPath(relativePath);
  const baseParts = normalizeBookPath(basePath).split("/");
  baseParts.pop();
  return normalizeBookPath([...baseParts, relativePath].join("/"));
};

const sanitizeChapter = (chapterDocument) => {
  chapterDocument
    .querySelectorAll("script, iframe, object, embed, form, input, button, textarea, select, link, style, base")
    .forEach((element) => element.remove());

  chapterDocument.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (
        name.startsWith("on") ||
        name === "srcdoc" ||
        name === "style" ||
        name === "hidden" ||
        name === "aria-hidden" ||
        name === "color" ||
        name === "bgcolor"
      ) {
        element.removeAttribute(attribute.name);
      } else if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      const href = element.getAttribute("href") || "";
      if (/^https?:/i.test(href)) {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
};

const appendChapter = async (section, index) => {
  const markup = await section.render(book.load.bind(book));
  const chapterDocument = new DOMParser().parseFromString(markup, "text/html");
  sanitizeChapter(chapterDocument);

  const chapter = document.createElement("section");
  chapter.className = "book-section";
  chapter.dataset.spineIndex = String(index);
  chapter.dataset.bookHref = normalizeBookPath(section.href || section.url || "");

  [...chapterDocument.body.childNodes].forEach((node) => {
    chapter.appendChild(document.importNode(node, true));
  });

  viewer.appendChild(chapter);
  chapterLookup.set(chapter.dataset.bookHref, chapter);
  section.unload?.();
};

const findChapterFragment = (chapter, fragment) => {
  if (!fragment) return chapter;

  let decoded = fragment;
  try {
    decoded = decodeURIComponent(fragment);
  } catch {
    // Use the literal fragment if it is not valid URL encoding.
  }

  return [...chapter.querySelectorAll("[id], [name]")].find((element) =>
    element.id === decoded || element.getAttribute("name") === decoded
  ) || chapter;
};

const handleBookLink = (event) => {
  const anchor = event.target?.closest?.("a[href]");
  if (!anchor) return;

  const href = anchor.getAttribute("href") || "";
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) {
    return;
  }

  const currentChapter = anchor.closest(".book-section");
  if (!currentChapter) return;

  const hashIndex = href.indexOf("#");
  const relativePath = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const fragment = hashIndex >= 0 ? href.slice(hashIndex + 1) : "";
  const targetPath = relativePath
    ? resolveBookPath(currentChapter.dataset.bookHref, relativePath)
    : currentChapter.dataset.bookHref;
  const targetChapter = chapterLookup.get(targetPath);
  if (!targetChapter) return;

  event.preventDefault();
  findChapterFragment(targetChapter, fragment).scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};

const flushRightDragScroll = () => {
  rightDragFrame = null;
  const pixels = pendingRightDragScroll;
  pendingRightDragScroll = 0;

  if (pixels !== 0) {
    window.scrollBy({ top: pixels, left: 0, behavior: "auto" });
  }
};

const queueRightDragScroll = (pixels) => {
  pendingRightDragScroll += pixels;
  if (rightDragFrame === null) {
    rightDragFrame = window.requestAnimationFrame(flushRightDragScroll);
  }
};

const stopRightDrag = (event) => {
  if (!rightDrag) return;
  if (event?.pointerId !== undefined && event.pointerId !== rightDrag.pointerId) return;

  const pointerId = rightDrag.pointerId;
  const captureTarget = rightDrag.captureTarget;
  rightDrag = null;

  try {
    captureTarget?.releasePointerCapture?.(pointerId);
  } catch {
    // Capture can already be gone after leaving the window.
  }

  document.body.classList.remove("is-right-dragging");

  if (rightDragFrame !== null) {
    window.cancelAnimationFrame(rightDragFrame);
    rightDragFrame = null;
    flushRightDragScroll();
  }

  event?.preventDefault?.();
};

const handleRightDragStart = (event) => {
  if (
    event.button !== 2 ||
    reader.hidden ||
    event.target?.closest?.("#settings-menu")
  ) return;

  event.preventDefault();
  const captureTarget = event.target?.setPointerCapture
    ? event.target
    : viewer;
  rightDrag = {
    pointerId: event.pointerId,
    lastY: event.clientY,
    captureTarget
  };
  pendingRightDragScroll = 0;
  captureTarget.setPointerCapture?.(event.pointerId);
  document.body.classList.add("is-right-dragging");
};

const handleRightDragMove = (event) => {
  if (!rightDrag || event.pointerId !== rightDrag.pointerId) return;
  if (event.buttons !== undefined && (event.buttons & 2) === 0) {
    stopRightDrag(event);
    return;
  }

  event.preventDefault();
  const deltaY = event.clientY - rightDrag.lastY;
  rightDrag.lastY = event.clientY;
  queueRightDragScroll(deltaY * RIGHT_DRAG_SPEED);
};

const waitForImages = async () => {
  const pending = [...viewer.querySelectorAll("img")]
    .filter((image) => !image.complete)
    .map((image) => new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    }));

  await Promise.all(pending);
};

const restorePosition = async (savedPosition) => {
  await document.fonts?.ready;
  await waitForImages();

  window.requestAnimationFrame(() => {
    const scrollRange = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const legacyRatio = Number(savedPosition?.percentage);
    const storedRatio = Number(savedPosition?.ratio);
    const storedY = Number(savedPosition?.scrollY);

    let target = 0;
    if (Number.isFinite(storedY)) {
      target = storedY;
    } else if (Number.isFinite(storedRatio)) {
      target = storedRatio * scrollRange;
    } else if (Number.isFinite(legacyRatio)) {
      target = legacyRatio * scrollRange;
    }

    window.scrollTo(0, Math.max(0, Math.min(scrollRange, target)));
    updateReadingProgress();
  });
};

const normalizeSpeechText = (text) => String(text || "")
  .replace(/\bDr\./g, "Doctor")
  .replace(/\bMr\./g, "Mister")
  .replace(/\bMs\./g, "Miss")
  .replace(/\s+/g, " ")
  .trim();

const applySpeechBounds = (nextMinimum, nextMaximum, changed = "", announce = false) => {
  let minimum = Math.round(Math.max(
    MIN_SPEECH_MIN_LENGTH,
    Math.min(MAX_SPEECH_MIN_LENGTH, nextMinimum)
  ));
  let maximum = Math.round(Math.max(
    MIN_SPEECH_MAX_LENGTH,
    Math.min(MAX_SPEECH_MAX_LENGTH, nextMaximum)
  ));

  if (minimum > maximum) {
    if (changed === "maximum") minimum = maximum;
    else maximum = minimum;
  }
  speechMinimumLength = minimum;
  speechMaximumLength = maximum;
  localStorage.setItem(SPEECH_MIN_KEY, String(minimum));
  localStorage.setItem(SPEECH_MAX_KEY, String(maximum));
  settingsSpeechMin.value = String(minimum);
  settingsSpeechMax.value = String(maximum);
  settingsSpeechMinValue.textContent = `${minimum} chars`;
  settingsSpeechMaxValue.textContent = `${maximum} chars`;
  if (announce) showStatus(`PIPER CHUNKS · ${minimum}–${maximum} CHARACTERS`, 1400);
};

applySpeechBounds(speechMinimumLength, speechMaximumLength);

const speechSourceFromEntries = (entries) => {
  let text = "";
  const segments = [];
  entries.forEach((entry) => {
    const entryText = normalizeSpeechText(entry.text);
    if (!entryText) return;
    if (text) text += " ";
    const start = text.length;
    text += entryText;
    segments.push({
      start,
      end: text.length,
      element: entry.element,
      selectedRange: entry.selectedRange || null,
      mapBaseOffset: entry.mapBaseOffset || 0
    });
  });
  return { text, segments };
};

const buildSpeechJobs = (
  entries,
  minimumLength = speechMinimumLength,
  maximumLength = speechMaximumLength
) => {
  const source = speechSourceFromEntries(entries);
  const totalLength = source.text.length;
  if (totalLength === 0) return [];

  const minimum = Math.max(1, Math.min(minimumLength, maximumLength));
  const maximum = Math.max(minimum, maximumLength);
  const sentences = [];
  const sentencePattern = /[^.!?]*[.!?]+["'’”)]*|[^.!?]+$/g;
  for (const match of source.text.matchAll(sentencePattern)) {
    let start = match.index;
    let end = start + match[0].length;
    while (start < end && /\s/.test(source.text[start])) start += 1;
    while (end > start && /\s/.test(source.text[end - 1])) end -= 1;
    if (end > start) sentences.push({ start, end });
  }

  const groups = [];
  let current = null;
  sentences.forEach((sentence) => {
    if (!current) {
      current = { ...sentence };
      return;
    }
    const currentLength = current.end - current.start;
    const combinedLength = sentence.end - current.start;
    if (currentLength >= minimum && combinedLength > maximum) {
      groups.push(current);
      current = { ...sentence };
    } else {
      current.end = sentence.end;
    }
  });
  if (current) groups.push(current);
  if (groups.length > 1) {
    const tail = groups.at(-1);
    if (tail.end - tail.start < minimum) {
      groups[groups.length - 2].end = tail.end;
      groups.pop();
    }
  }

  const jobs = groups.map(({ start, end }) => {
    let text = source.text.slice(start, end).trim();
    if (!/[.!?]["'’”)]*$/.test(text)) text += ".";
    const segments = source.segments.filter((segment) => (
      segment.end > start && segment.start < end
    ));
    return {
      element: segments[0]?.element || null,
      text,
      sourceStart: start,
      sourceEnd: end,
      segments
    };
  });
  return jobs;
};

const splitSpeechText = (
  text,
  minimumLength = speechMinimumLength,
  maximumLength = speechMaximumLength
) => buildSpeechJobs([{ element: null, text }], minimumLength, maximumLength)
  .map((job) => job.text);

const replaceMappedText = (mappedText, pattern, replacement) => {
  const resultText = [];
  const resultMap = [];
  let cursor = 0;
  for (const match of mappedText.text.matchAll(pattern)) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;
    resultText.push(mappedText.text.slice(cursor, matchStart));
    resultMap.push(...mappedText.map.slice(cursor, matchStart));
    const firstPoint = mappedText.map[matchStart];
    const lastPoint = mappedText.map[Math.max(matchStart, matchEnd - 1)];
    resultText.push(replacement);
    for (let index = 0; index < replacement.length; index += 1) {
      resultMap.push({
        startNode: firstPoint.startNode,
        startOffset: firstPoint.startOffset,
        endNode: lastPoint.endNode,
        endOffset: lastPoint.endOffset
      });
    }
    cursor = matchEnd;
  }
  resultText.push(mappedText.text.slice(cursor));
  resultMap.push(...mappedText.map.slice(cursor));
  return { text: resultText.join(""), map: resultMap };
};

const createSpeechTextMap = (element) => {
  if (!element || !document.createTreeWalker) return null;
  const cached = speechTextMaps.get(element);
  if (cached) return cached;

  const walker = document.createTreeWalker(element, 4);
  const characters = [];
  const points = [];
  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue || "";
    for (let offset = 0; offset < value.length; offset += 1) {
      characters.push(value[offset]);
      points.push({
        startNode: node,
        startOffset: offset,
        endNode: node,
        endOffset: offset + 1
      });
    }
    node = walker.nextNode();
  }

  let mapped = { text: characters.join(""), map: points };
  mapped = replaceMappedText(mapped, /\bDr\./g, "Doctor");
  mapped = replaceMappedText(mapped, /\bMr\./g, "Mister");
  mapped = replaceMappedText(mapped, /\bMs\./g, "Miss");

  const normalizedCharacters = [];
  const normalizedMap = [];
  let inWhitespace = false;
  for (let index = 0; index < mapped.text.length; index += 1) {
    const character = mapped.text[index];
    if (/\s/.test(character)) {
      if (!inWhitespace && normalizedCharacters.length > 0) {
        normalizedCharacters.push(" ");
        normalizedMap.push(mapped.map[index]);
      }
      inWhitespace = true;
    } else {
      normalizedCharacters.push(character);
      normalizedMap.push(mapped.map[index]);
      inWhitespace = false;
    }
  }
  if (normalizedCharacters.at(-1) === " ") {
    normalizedCharacters.pop();
    normalizedMap.pop();
  }
  const result = { text: normalizedCharacters.join(""), map: normalizedMap };
  speechTextMaps.set(element, result);
  return result;
};

const domBoundaryForOffset = (mapped, offset, isEnd) => {
  if (!mapped?.map.length) return null;
  if (offset <= 0) {
    const point = mapped.map[0];
    return { node: point.startNode, offset: point.startOffset };
  }
  if (offset >= mapped.map.length) {
    const point = mapped.map.at(-1);
    return { node: point.endNode, offset: point.endOffset };
  }
  const point = isEnd ? mapped.map[offset - 1] : mapped.map[offset];
  return isEnd
    ? { node: point.endNode, offset: point.endOffset }
    : { node: point.startNode, offset: point.startOffset };
};

const createSpeechRange = (job) => {
  const firstSegment = job?.segments?.[0];
  const lastSegment = job?.segments?.at(-1);
  if (!firstSegment || !lastSegment || !document.createRange) return null;
  if (!firstSegment.element && firstSegment.selectedRange && firstSegment === lastSegment) {
    return firstSegment.selectedRange.cloneRange?.() || firstSegment.selectedRange;
  }
  if (!firstSegment.element || !lastSegment.element) return null;

  const firstMap = createSpeechTextMap(firstSegment.element);
  const lastMap = firstSegment.element === lastSegment.element
    ? firstMap
    : createSpeechTextMap(lastSegment.element);
  const startOffset = Math.max(
    0,
    firstSegment.mapBaseOffset + job.sourceStart - firstSegment.start
  );
  const endOffset = Math.max(
    0,
    lastSegment.mapBaseOffset + job.sourceEnd - lastSegment.start
  );
  const startBoundary = domBoundaryForOffset(firstMap, startOffset, false);
  const endBoundary = domBoundaryForOffset(lastMap, endOffset, true);
  if (!startBoundary || !endBoundary) return null;

  try {
    const range = document.createRange();
    range.setStart(startBoundary.node, startBoundary.offset);
    range.setEnd(endBoundary.node, endBoundary.offset);
    return range;
  } catch {
    return null;
  }
};

const clearSpeechVisuals = () => {
  speechActiveElements.forEach((element) => element.classList?.remove("speech-active"));
  speechActiveElements = [];
  speechMarker.hidden = true;
};

const positionSpeechMarker = (followText = false) => {
  clearSpeechVisuals();
  if (!speechActiveJob) return;

  const range = createSpeechRange(speechActiveJob);
  const rects = [...(range?.getClientRects?.() || [])]
    .filter((rect) => rect.height > 0 && rect.width > 0);
  const firstElement = speechActiveJob.segments?.find(
    (segment) => segment.element
  )?.element;
  if (rects.length > 0) {
    const firstRect = rects[0];
    const lastRect = rects.at(-1);
    const blockRect = firstElement?.getBoundingClientRect?.();
    const blockLeft = Number.isFinite(blockRect?.left) ? blockRect.left : firstRect.left;
    speechMarker.style.left = `${(window.scrollX || 0) + Math.max(8, blockLeft - 18)}px`;
    speechMarker.style.top = `${window.scrollY + firstRect.top}px`;
    speechMarker.style.height = `${Math.max(18, lastRect.bottom - firstRect.top)}px`;
    speechMarker.hidden = false;

    const scrollOffset = firstRect.top - window.innerHeight * 0.28;
    if (followText && Math.abs(scrollOffset) > 1) {
      window.scrollBy({
        top: scrollOffset,
        left: 0,
        behavior: "smooth"
      });
    }
  } else {
    speechActiveElements = [...new Set(
      (speechActiveJob.segments || []).map((segment) => segment.element).filter(Boolean)
    )];
    speechActiveElements.forEach((element) => element.classList?.add("speech-active"));
  }

  const rect = firstElement?.getBoundingClientRect?.();
  if (
    followText &&
    rects.length === 0 &&
    rect &&
    (rect.top < 60 || rect.bottom > window.innerHeight - 40)
  ) {
    firstElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

function scheduleSpeechMarkerRefresh() {
  if (!speechActiveJob || speechMarkerFrame !== null) return;
  speechMarkerFrame = window.requestAnimationFrame(() => {
    speechMarkerFrame = null;
    positionSpeechMarker(false);
  });
}

const clearSpeechSelection = () => {
  speechActiveJob = null;
  if (speechMarkerFrame !== null) {
    window.cancelAnimationFrame(speechMarkerFrame);
    speechMarkerFrame = null;
  }
  clearSpeechVisuals();
};

const setSpeechActiveJob = (job) => {
  clearSpeechSelection();
  speechActiveJob = job;
  positionSpeechMarker(true);
};

const updateSpeechVoices = (voices) => {
  const selected = settingsSpeechVoice.value;
  settingsSpeechVoice.replaceChildren();
  const randomOption = document.createElement("option");
  randomOption.value = "";
  randomOption.textContent = "RANDOM VOICE";
  settingsSpeechVoice.appendChild(randomOption);

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice;
    option.textContent = voice.replace(/\.onnx$/i, "").toUpperCase();
    settingsSpeechVoice.appendChild(option);
  });
  settingsSpeechVoice.value = voices.includes(selected) ? selected : "";
};

const requestPiper = async (path, options = {}) => {
  if (typeof window.fetch !== "function") {
    throw new Error("Local Piper bridge is not available.");
  }
  const response = await window.fetch(path, options);
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // A static host returns HTML/404 here; report the bridge instructions below.
  }
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || "Run piper_bridge.py and open its local URL.");
  }
  return payload;
};

const inspectPiperBridge = async () => {
  const bridge = await requestPiper("/api/piper/status");
  if (!bridge.available) throw new Error(bridge.error || "Piper or mpv was not found.");
  updateSpeechVoices(bridge.voices || []);
  settingsSpeechStatus.textContent = `${bridge.voices.length} local voice${bridge.voices.length === 1 ? "" : "s"} ready.`;
  return bridge;
};

const speechBlocksFromViewport = () => {
  const blocks = [...viewer.querySelectorAll(SPEECH_BLOCK_SELECTOR)]
    .filter((element) => normalizeSpeechText(element.textContent));
  if (blocks.length === 0) return [];

  const x = window.innerWidth / 2;
  const y = Math.max(64, Math.min(window.innerHeight - 64, window.innerHeight * 0.32));
  const pointedBlock = document.elementFromPoint?.(x, y)?.closest?.(SPEECH_BLOCK_SELECTOR);
  let startIndex = pointedBlock ? blocks.indexOf(pointedBlock) : -1;
  if (startIndex < 0) {
    startIndex = blocks.findIndex((element) => element.getBoundingClientRect().bottom > 60);
  }
  return blocks.slice(Math.max(0, startIndex));
};

const stopSpeech = () => {
  const wasActive = speechIsActive;
  speechGeneration += 1;
  speechIsActive = false;
  speechIsPaused = false;
  settingsSpeechStart.disabled = false;
  settingsSpeechPause.disabled = true;
  settingsSpeechPause.textContent = "PAUSE";
  settingsSpeechStop.disabled = true;
  clearSpeechSelection();

  if (wasActive && typeof window.fetch === "function") {
    window.fetch("/api/piper/stop", { method: "POST", keepalive: true }).catch(() => {});
    settingsSpeechStatus.textContent = "Stopped.";
    showStatus("PIPER · STOPPED", 900);
  }
};

const toggleSpeechPause = async () => {
  if (!speechIsActive) return;
  const nextPaused = !speechIsPaused;
  try {
    const result = await requestPiper(
      nextPaused ? "/api/piper/pause" : "/api/piper/resume",
      { method: "POST" }
    );
    if (!result.active) throw new Error("No Piper audio is currently playing.");
    speechIsPaused = Boolean(result.paused);
    settingsSpeechPause.textContent = speechIsPaused ? "CONTINUE" : "PAUSE";
    settingsSpeechStatus.textContent = speechIsPaused
      ? "Playback paused; background generation may continue."
      : "Playback continuing…";
    showStatus(speechIsPaused ? "PIPER · PAUSED" : "PIPER · CONTINUING", 900);
  } catch (error) {
    const message = error?.message || "Piper pause control failed.";
    settingsSpeechStatus.textContent = message;
    showStatus(`PIPER · ${message}`, 2200);
  }
};

const startSpeech = async () => {
  if (reader.hidden || viewer.children.length === 0 || speechIsActive) return;
  const generation = ++speechGeneration;
  speechIsActive = true;
  speechIsPaused = false;
  settingsSpeechStart.disabled = true;
  settingsSpeechPause.disabled = true;
  settingsSpeechPause.textContent = "PAUSE";
  settingsSpeechStop.disabled = false;
  settingsSpeechStatus.textContent = "Connecting to local Piper…";

  try {
    await inspectPiperBridge();
    if (generation !== speechGeneration) return;

    const currentSelection = window.getSelection?.();
    const selectedText = normalizeSpeechText(currentSelection?.toString());
    const selectedRange = selectedText && currentSelection?.rangeCount
      ? currentSelection.getRangeAt(0).cloneRange()
      : null;
    const selectedContainer = selectedRange?.commonAncestorContainer;
    const selectedElement = selectedContainer?.nodeType === 1
      ? selectedContainer
      : selectedContainer?.parentElement;
    const selectedMap = selectedElement ? createSpeechTextMap(selectedElement) : null;
    const selectedMapOffset = selectedMap?.text.indexOf(selectedText) ?? -1;
    if (selectedText) currentSelection?.removeAllRanges();
    const entries = selectedText
      ? [{
        element: selectedMapOffset >= 0 ? selectedElement : null,
        text: selectedText,
        selectedRange,
        mapBaseOffset: Math.max(0, selectedMapOffset)
      }]
      : speechBlocksFromViewport().map((element) => ({
        element,
        text: normalizeSpeechText(element.textContent)
      }));
    if (entries.length === 0) throw new Error("No readable text was found here.");
    const jobs = buildSpeechJobs(entries);
    if (jobs.length === 0) throw new Error("No readable text was found here.");

    const requestedVoice = settingsSpeechVoice.value || null;
    const prepareJob = (job) => requestPiper("/api/piper/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: job.text, voice: requestedVoice })
    });
    const settlePreparation = (job) => prepareJob(job)
      .then((value) => ({ value }), (error) => ({ error }));

    settingsSpeechStatus.textContent = "Generating first chunk…";
    let prepared = await prepareJob(jobs[0]);

    for (let index = 0; index < jobs.length; index += 1) {
      if (generation !== speechGeneration) return;
      const nextPreparation = index + 1 < jobs.length
        ? settlePreparation(jobs[index + 1])
        : null;
      const progress = `${index + 1}/${jobs.length}`;
      const voiceName = prepared.voice?.replace(/\.onnx$/i, "") || "Piper";
      setSpeechActiveJob(jobs[index]);
      settingsSpeechStatus.textContent = nextPreparation
        ? `Playing ${progress} with ${voiceName}; generating next…`
        : `Playing ${progress} with ${voiceName}…`;
      showStatus(`PIPER · ${progress}${prepared.cached ? " · CACHE" : ""}`);
      settingsSpeechPause.disabled = false;

      await requestPiper("/api/piper/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cacheId: prepared.cacheId })
      });
      speechIsPaused = false;
      settingsSpeechPause.disabled = true;
      settingsSpeechPause.textContent = "PAUSE";
      if (generation !== speechGeneration) return;

      if (nextPreparation) {
        const settled = await nextPreparation;
        if (settled.error) throw settled.error;
        prepared = settled.value;
      }
    }

    if (generation !== speechGeneration) return;
    speechIsActive = false;
    speechIsPaused = false;
    settingsSpeechStart.disabled = false;
    settingsSpeechPause.disabled = true;
    settingsSpeechPause.textContent = "PAUSE";
    settingsSpeechStop.disabled = true;
    clearSpeechSelection();
    settingsSpeechStatus.textContent = "Finished.";
    showStatus("PIPER · FINISHED", 1000);
  } catch (error) {
    if (generation !== speechGeneration) return;
    speechIsActive = false;
    speechIsPaused = false;
    settingsSpeechStart.disabled = false;
    settingsSpeechPause.disabled = true;
    settingsSpeechPause.textContent = "PAUSE";
    settingsSpeechStop.disabled = true;
    clearSpeechSelection();
    const message = error?.message || "Local Piper could not read this text.";
    settingsSpeechStatus.textContent = message;
    showStatus(`PIPER · ${message}`, 3200);
  }
};

const openBook = async (file) => {
  if (!file?.name?.toLowerCase().endsWith(".epub")) {
    showStatus("Please drop an EPUB file.");
    return;
  }

  const generation = ++loadGeneration;
  clearStatus();
  showStatus("OPENING…");

  try {
    const bytes = await file.arrayBuffer();
    const hash = await hashBook(bytes);
    if (generation !== loadGeneration) return;

    destroyCurrentBook();
    activeBookKey = hash;
    const savedPosition = loadPosition(hash);

    book = ePub(bytes);
    await book.opened;
    await book.ready;
    if (generation !== loadGeneration) return;

    const sections = [];
    book.spine.each((section) => {
      sections.push(section);
    });

    setReadingMode(true);
    for (let index = 0; index < sections.length; index += 1) {
      if (generation !== loadGeneration) return;
      showStatus(`LOADING ${index + 1} / ${sections.length}`);
      await appendChapter(sections[index], index);
    }

    if (generation !== loadGeneration) return;
    await restorePosition(savedPosition);
    showStatus(
      `NATIVE SCROLL · ${sections.length} SECTIONS · HOME · PAGE UP / PAGE DOWN`,
      2800
    );

    const metadata = await book.loaded.metadata;
    const lastBookInfo = {
      hash,
      fileName: file.name,
      title: metadata?.title || "",
      openedAt: Date.now()
    };
    localStorage.setItem(LAST_BOOK_KEY, JSON.stringify(lastBookInfo));
    recentBookInfo = [
      lastBookInfo,
      ...recentBookInfo.filter((record) => !booksMatch(lastBookInfo, record))
    ].slice(0, MAX_RECENT_BOOKS);
    localStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(recentBookInfo));

    try {
      const cachedBook = { ...lastBookInfo, bytes };
      cachedRecentBooks = [
        cachedBook,
        ...cachedRecentBooks.filter((record) => !booksMatch(cachedBook, record))
      ].slice(0, MAX_RECENT_BOOKS);
      lastBookCanReopen = await writeCachedBooks(cachedRecentBooks);
    } catch (error) {
      lastBookCanReopen = false;
      console.warn("Could not cache the EPUB for reopening.", error);
    }
    renderRecentBooks();

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

const reopenCachedBook = (record) => {
  const cached = cachedRecentBooks.find((candidate) => booksMatch(record, candidate));
  if (!cached?.bytes) {
    showStatus("THIS BOOK IS NOT CACHED · DROP IT AGAIN", 1800);
    return;
  }

  openBook({
    name: cached.fileName,
    arrayBuffer: async () => cached.bytes.slice(0)
  }).catch((error) => {
    console.error(error);
    cachedRecentBooks = cachedRecentBooks.filter(
      (candidate) => !booksMatch(record, candidate)
    );
    lastBookCanReopen = Boolean(
      cachedRecentBooks.find((candidate) => booksMatch(recentBookInfo[0], candidate))?.bytes
    );
    renderRecentBooks();
    showStatus("CACHED BOOK COULD NOT BE REOPENED · DROP IT AGAIN", 2200);
  });
};

const reopenLastBook = () => {
  if (!lastBookCanReopen || recentBookInfo.length === 0) {
    showStatus("LAST BOOK IS NOT CACHED · DROP IT AGAIN", 1800);
    return;
  }
  reopenCachedBook(recentBookInfo[0]);
};

const scrollToBookStart = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
};

const scrollToBookEnd = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    left: 0,
    behavior: "smooth"
  });
};

const scrollOnePage = (direction) => {
  window.scrollBy({
    top: direction * window.innerHeight * PAGE_SCROLL_RATIO,
    left: 0,
    behavior: "smooth"
  });
};

const returnToHomeScreen = () => {
  loadGeneration += 1;
  clearStatus();
  destroyCurrentBook();
  activeBookKey = null;
  setReadingMode(false);
  renderRecentBooks();
  document.title = "Smooth Reader";
};

const isEditableTarget = (target) => {
  const tagName = target?.tagName?.toLowerCase();
  return target?.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select";
};

const handleReaderKeyDown = (event) => {
  if (event.defaultPrevented || isEditableTarget(event.target)) return;

  const key = event.key.toLowerCase();
  const noCommandModifier = !event.ctrlKey && !event.metaKey && !event.altKey;

  if (noCommandModifier && !event.shiftKey && key === "o") {
    event.preventDefault();
    fileInput.click();
    return;
  }

  if (noCommandModifier && !event.shiftKey && key === "r") {
    event.preventDefault();
    reopenLastBook();
    return;
  }

  if (noCommandModifier && !event.shiftKey && !event.repeat && key === "v") {
    event.preventDefault();
    if (speechIsActive) stopSpeech();
    else startSpeech();
    return;
  }

  if (noCommandModifier && !event.shiftKey && key === "escape" && speechIsActive) {
    event.preventDefault();
    stopSpeech();
    return;
  }

  if (noCommandModifier && !event.repeat && event.key === "[") {
    event.preventDefault();
    applyFontSize(fontSizePx - FONT_SIZE_STEP_PX);
    return;
  }

  if (noCommandModifier && !event.repeat && event.key === "]") {
    event.preventDefault();
    applyFontSize(fontSizePx + FONT_SIZE_STEP_PX);
    return;
  }

  if (noCommandModifier && !event.repeat && event.key === "{") {
    event.preventDefault();
    applyLineHeight(lineHeight - LINE_HEIGHT_STEP);
    return;
  }

  if (noCommandModifier && !event.repeat && event.key === "}") {
    event.preventDefault();
    applyLineHeight(lineHeight + LINE_HEIGHT_STEP);
    return;
  }

  if (
    noCommandModifier &&
    !event.repeat &&
    (event.key === "+" || event.key === "=")
  ) {
    event.preventDefault();
    applyTracking(trackingEm + TRACKING_STEP_EM);
    return;
  }

  if (noCommandModifier && !event.repeat && event.key === "-") {
    event.preventDefault();
    applyTracking(trackingEm - TRACKING_STEP_EM);
    return;
  }

  if (noCommandModifier && !event.shiftKey && !event.repeat && event.key === "0") {
    event.preventDefault();
    applyTracking(DEFAULT_TRACKING_EM);
    return;
  }

  if (noCommandModifier && key === "home") {
    event.preventDefault();
    scrollToBookStart();
    return;
  }

  if (noCommandModifier && key === "end") {
    event.preventDefault();
    scrollToBookEnd();
    return;
  }

  if (noCommandModifier && (key === "pageup" || key === "pagedown")) {
    event.preventDefault();
    const direction = key === "pageup" ? -1 : 1;
    scrollOnePage(direction);
    return;
  }

  if (noCommandModifier && key === "p" && !event.repeat) {
    event.preventDefault();
    applyPalette(paletteIndex + (event.shiftKey ? -1 : 1));
    return;
  }

  if (noCommandModifier && key === "f" && !event.repeat) {
    event.preventDefault();
    applyFont(fontIndex + (event.shiftKey ? -1 : 1));
    return;
  }

  if (
    event.altKey &&
    event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    key === "m"
  ) {
    event.preventDefault();
    applyFont(FONTS.findIndex((font) => font.id === "system-mono"));
    return;
  }

  if (
    event.altKey &&
    event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    /^[0-9]$/.test(event.key)
  ) {
    event.preventDefault();
    applyFont(event.key === "0" ? 9 : Number(event.key) - 1);
    return;
  }

  if (
    event.altKey &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    /^[0-9]$/.test(event.key)
  ) {
    event.preventDefault();
    applyPalette(event.key === "0" ? 9 : Number(event.key) - 1);
  }
};

dropPicker.addEventListener("click", () => fileInput.click());
startOpen.addEventListener("click", () => fileInput.click());
settingsOpen.addEventListener("click", () => fileInput.click());
startReopen.addEventListener("click", reopenLastBook);
settingsReopen.addEventListener("click", reopenLastBook);
settingsSpeechStart.addEventListener("click", startSpeech);
settingsSpeechPause.addEventListener("click", toggleSpeechPause);
settingsSpeechStop.addEventListener("click", stopSpeech);

settingsSpeechMin.addEventListener("input", (event) => {
  applySpeechBounds(Number(event.target.value), speechMaximumLength, "minimum");
});
settingsSpeechMin.addEventListener("change", (event) => {
  applySpeechBounds(Number(event.target.value), speechMaximumLength, "minimum", true);
});
settingsSpeechMax.addEventListener("input", (event) => {
  applySpeechBounds(speechMinimumLength, Number(event.target.value), "maximum");
});
settingsSpeechMax.addEventListener("change", (event) => {
  applySpeechBounds(speechMinimumLength, Number(event.target.value), "maximum", true);
});

startPaletteNext.addEventListener("click", () => applyPalette(paletteIndex + 1));
startFontNext.addEventListener("click", () => applyFont(fontIndex + 1));
startPaletteSelect.addEventListener("change", (event) => {
  applyPalette(PALETTES.findIndex((palette) => palette.id === event.target.value));
});
settingsPaletteSelect.addEventListener("change", (event) => {
  applyPalette(PALETTES.findIndex((palette) => palette.id === event.target.value));
});
startFontSelect.addEventListener("change", (event) => {
  applyFont(FONTS.findIndex((font) => font.id === event.target.value));
});
settingsFontSelect.addEventListener("change", (event) => {
  applyFont(FONTS.findIndex((font) => font.id === event.target.value));
});

const handleFontSizeInput = (event, announce = false) => {
  applyFontSize(Number(event.target.value), announce);
};
startFontSize.addEventListener("input", (event) => handleFontSizeInput(event));
settingsFontSize.addEventListener("input", (event) => handleFontSizeInput(event));
startFontSize.addEventListener("change", (event) => handleFontSizeInput(event, true));
settingsFontSize.addEventListener("change", (event) => handleFontSizeInput(event, true));

const handleLineHeightInput = (event, announce = false) => {
  applyLineHeight(Number(event.target.value), announce);
};
startLineHeight.addEventListener("input", (event) => handleLineHeightInput(event));
settingsLineHeight.addEventListener("input", (event) => handleLineHeightInput(event));
startLineHeight.addEventListener("change", (event) => handleLineHeightInput(event, true));
settingsLineHeight.addEventListener("change", (event) => handleLineHeightInput(event, true));

startTrackingDown.addEventListener("click", () => {
  applyTracking(trackingEm - TRACKING_STEP_EM);
});
settingsTrackingDown.addEventListener("click", () => {
  applyTracking(trackingEm - TRACKING_STEP_EM);
});
startTrackingReset.addEventListener("click", () => applyTracking(DEFAULT_TRACKING_EM));
settingsTrackingReset.addEventListener("click", () => applyTracking(DEFAULT_TRACKING_EM));
startTrackingUp.addEventListener("click", () => {
  applyTracking(trackingEm + TRACKING_STEP_EM);
});
settingsTrackingUp.addEventListener("click", () => {
  applyTracking(trackingEm + TRACKING_STEP_EM);
});

const handleWidthInput = (event, announce = false) => {
  applyWidth(Number(event.target.value), announce);
};
startWidth.addEventListener("input", (event) => handleWidthInput(event));
settingsWidth.addEventListener("input", (event) => handleWidthInput(event));
startWidth.addEventListener("change", (event) => handleWidthInput(event, true));
settingsWidth.addEventListener("change", (event) => handleWidthInput(event, true));

settingsToggle.addEventListener("click", () => {
  setSettingsOpen(settingsPanel.hidden);
});
settingsHome.addEventListener("click", returnToHomeScreen);
settingsPageUp.addEventListener("click", () => scrollOnePage(-1));
settingsPageDown.addEventListener("click", () => scrollOnePage(1));

window.addEventListener("click", (event) => {
  if (!settingsPanel.hidden && !event.target?.closest?.("#settings-menu")) {
    setSettingsOpen(false);
  }
});

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

const installDropTarget = (target) => {
  target.addEventListener("dragenter", handleDragEnter);
  target.addEventListener("dragover", handleDragOver);
  target.addEventListener("dragleave", handleDragLeave);
  target.addEventListener("drop", handleDrop);
};

installDropTarget(window);

viewer.addEventListener("click", handleBookLink);
window.addEventListener("pointerdown", handleRightDragStart);
window.addEventListener("pointermove", handleRightDragMove);
window.addEventListener("pointerup", stopRightDrag);
window.addEventListener("pointercancel", stopRightDrag);
window.addEventListener("lostpointercapture", stopRightDrag);
window.addEventListener("contextmenu", (event) => {
  if (!reader.hidden) event.preventDefault();
});
window.addEventListener("keydown", handleReaderKeyDown, true);
window.addEventListener("scroll", () => {
  schedulePositionSave();
  updateReadingProgress();
}, { passive: true });
window.addEventListener("resize", scheduleSpeechMarkerRefresh, { passive: true });
if (typeof window.ResizeObserver === "function") {
  const speechLayoutObserver = new window.ResizeObserver(scheduleSpeechMarkerRefresh);
  speechLayoutObserver.observe(viewer);
}
window.addEventListener("blur", () => stopRightDrag());
window.addEventListener("beforeunload", savePositionNow);
