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
const startContrast = document.querySelector("#start-contrast");
const startContrastValue = document.querySelector("#start-contrast-value");
const startContrastDown = document.querySelector("#start-contrast-down");
const startContrastUp = document.querySelector("#start-contrast-up");
const startFontNext = document.querySelector("#start-font-next");
const startFontSelect = document.querySelector("#start-font");
const startFontSize = document.querySelector("#start-font-size");
const startFontSizeValue = document.querySelector("#start-font-size-value");
const startFontSizeDown = document.querySelector("#start-font-size-down");
const startFontSizeUp = document.querySelector("#start-font-size-up");
const startLineHeight = document.querySelector("#start-line-height");
const startLineHeightValue = document.querySelector("#start-line-height-value");
const startLineHeightDown = document.querySelector("#start-line-height-down");
const startLineHeightUp = document.querySelector("#start-line-height-up");
const startTrackingDown = document.querySelector("#start-tracking-down");
const startTrackingReset = document.querySelector("#start-tracking-reset");
const startTrackingUp = document.querySelector("#start-tracking-up");
const startWidth = document.querySelector("#start-width");
const startWidthValue = document.querySelector("#start-width-value");
const startWidthDown = document.querySelector("#start-width-down");
const startWidthUp = document.querySelector("#start-width-up");
const startResetAll = document.querySelector("#start-reset-all");
const settingsMenu = document.querySelector("#settings-menu");
const settingsToggle = document.querySelector("#settings-toggle");
const settingsPanel = document.querySelector("#settings-panel");
const settingsPaletteSelect = document.querySelector("#settings-palette");
const settingsContrast = document.querySelector("#settings-contrast");
const settingsContrastValue = document.querySelector("#settings-contrast-value");
const settingsContrastDown = document.querySelector("#settings-contrast-down");
const settingsContrastUp = document.querySelector("#settings-contrast-up");
const settingsFontSelect = document.querySelector("#settings-font");
const settingsFontSize = document.querySelector("#settings-font-size");
const settingsFontSizeValue = document.querySelector("#settings-font-size-value");
const settingsFontSizeDown = document.querySelector("#settings-font-size-down");
const settingsFontSizeUp = document.querySelector("#settings-font-size-up");
const settingsLineHeight = document.querySelector("#settings-line-height");
const settingsLineHeightValue = document.querySelector("#settings-line-height-value");
const settingsLineHeightDown = document.querySelector("#settings-line-height-down");
const settingsLineHeightUp = document.querySelector("#settings-line-height-up");
const settingsTrackingValue = document.querySelector("#settings-tracking-value");
const settingsTrackingDown = document.querySelector("#settings-tracking-down");
const settingsTrackingReset = document.querySelector("#settings-tracking-reset");
const settingsTrackingUp = document.querySelector("#settings-tracking-up");
const settingsWidth = document.querySelector("#settings-width");
const settingsWidthValue = document.querySelector("#settings-width-value");
const settingsWidthDown = document.querySelector("#settings-width-down");
const settingsWidthUp = document.querySelector("#settings-width-up");
const settingsSpeechVoice = document.querySelector("#settings-speech-voice");
const settingsSpeechMin = document.querySelector("#settings-speech-min");
const settingsSpeechMinValue = document.querySelector("#settings-speech-min-value");
const settingsSpeechMinDown = document.querySelector("#settings-speech-min-down");
const settingsSpeechMinUp = document.querySelector("#settings-speech-min-up");
const settingsSpeechMax = document.querySelector("#settings-speech-max");
const settingsSpeechMaxValue = document.querySelector("#settings-speech-max-value");
const settingsSpeechMaxDown = document.querySelector("#settings-speech-max-down");
const settingsSpeechMaxUp = document.querySelector("#settings-speech-max-up");
const settingsSpeechPosition = document.querySelector("#settings-speech-position");
const settingsSpeechPositionValue = document.querySelector("#settings-speech-position-value");
const settingsSpeechPositionDown = document.querySelector("#settings-speech-position-down");
const settingsSpeechPositionUp = document.querySelector("#settings-speech-position-up");
const settingsSpeechStart = document.querySelector("#settings-speech-start");
const settingsSpeechPause = document.querySelector("#settings-speech-pause");
const settingsSpeechStop = document.querySelector("#settings-speech-stop");
const settingsSpeechStatus = document.querySelector("#settings-speech-status");
const speechMarker = document.querySelector("#speech-marker");
const speechAudio = document.querySelector("#speech-audio");
const settingsHome = document.querySelector("#settings-home");
const settingsPageUp = document.querySelector("#settings-page-up");
const settingsPageDown = document.querySelector("#settings-page-down");
const settingsOpen = document.querySelector("#settings-open");
const settingsReopen = document.querySelector("#settings-reopen");
const settingsResetAll = document.querySelector("#settings-reset-all");
const readingProgress = document.querySelector("#reading-progress");
const speechVoice = document.querySelector("#speech-voice");
const speechProgress = document.querySelector("#speech-progress");
const speechControls = document.querySelector("#speech-controls");
const speechOverlayPause = document.querySelector("#speech-overlay-pause");
const speechOverlayStop = document.querySelector("#speech-overlay-stop");
const speechOverlayHome = document.querySelector("#speech-overlay-home");

const POSITION_PREFIX = "smooth-reader:position:";
const BOOK_SETTINGS_PREFIX = "smooth-reader:book-settings:";
const PALETTE_KEY = "smooth-reader:palette";
const CONTRAST_KEY = "smooth-reader:contrast";
const FONT_KEY = "smooth-reader:font";
const FONT_SIZE_KEY = "smooth-reader:font-size";
const LINE_HEIGHT_KEY = "smooth-reader:line-height";
const TRACKING_KEY = "smooth-reader:tracking";
const WIDTH_KEY = "smooth-reader:text-width";
const SPEECH_MIN_KEY = "smooth-reader:speech-minimum";
const SPEECH_MAX_KEY = "smooth-reader:speech-maximum";
const SPEECH_POSITION_KEY = "smooth-reader:speech-position";
const SPEECH_SESSION_KEY = "smooth-reader:speech-session";
const SILENT_WAV_DATA_URL = "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
const LAST_BOOK_KEY = "smooth-reader:last-book";
const RECENT_BOOKS_KEY = "smooth-reader:recent-books";
const LAST_BOOK_DB = "smooth-reader-library";
const LAST_BOOK_STORE = "books";
const LAST_BOOK_RECORD = "last-opened";
const RECENT_BOOKS_RECORD = "recent-books";
const MAX_RECENT_BOOKS = 6;
const SAVE_DELAY_MS = 180;
const PAGE_SCROLL_RATIO = 0.88;
const RIGHT_DRAG_SPEED = 1.35;
const DEFAULT_TRACKING_EM = 0.02;
const DEFAULT_CONTRAST = 0;
const MIN_CONTRAST = -30;
const MAX_CONTRAST = 30;
const TRACKING_STEP_EM = 0.01;
const MIN_TRACKING_EM = -0.03;
const MAX_TRACKING_EM = 0.12;
const DEFAULT_WIDTH_CH = 44;
const MIN_WIDTH_CH = 8;
const MAX_WIDTH_CH = 100;
const DEFAULT_FONT_SIZE_PX = 36;
const MIN_FONT_SIZE_PX = 14;
const MAX_FONT_SIZE_PX = 80;
const FONT_SIZE_STEP_PX = 2;
const DEFAULT_LINE_HEIGHT = 1.28;
const MIN_LINE_HEIGHT = 1.2;
const MAX_LINE_HEIGHT = 2.2;
const LINE_HEIGHT_STEP = 0.04;
const DEFAULT_SPEECH_MIN_LENGTH = 150;
const DEFAULT_SPEECH_MAX_LENGTH = 350;
const MIN_SPEECH_MIN_LENGTH = 100;
const MAX_SPEECH_MIN_LENGTH = 500;
const MIN_SPEECH_MAX_LENGTH = 300;
const MAX_SPEECH_MAX_LENGTH = 1200;
const DEFAULT_SPEECH_POSITION_PERCENT = 22;
const MIN_SPEECH_POSITION_PERCENT = 5;
const MAX_SPEECH_POSITION_PERCENT = 50;
const SPEECH_SCROLL_DURATION_MS = 5;
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
  { id: "envy-code-r-nerd", name: "ENVY CODE R NERD" },
  { id: "system-mono", name: "SYSTEM MONO" }
];

let book = null;
let activeBookKey = null;
let saveTimer = null;
let statusTimer = null;
let loadGeneration = 0;
let isBookLoading = false;
let positionPersistenceSuspended = false;
let dragDepth = 0;
let rightDrag = null;
let rightDragFrame = null;
let pendingRightDragScroll = 0;
let lastPointerType = "mouse";
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
let speechAudioFinish = null;
let speechAudioUnlockPromise = Promise.resolve();
let speechMarkerFrame = null;
let speechScrollFrame = null;
let speechTextMaps = new WeakMap();
let speechVoicePreference = "";
let piperAvailable = false;
let suppressSettingsPersistence = false;
const chapterLookup = new Map();
const savedPaletteIndex = PALETTES.findIndex(
  (palette) => palette.id === localStorage.getItem(PALETTE_KEY)
);
let paletteIndex = savedPaletteIndex >= 0
  ? savedPaletteIndex
  : PALETTES.findIndex((palette) => palette.id === "nord");
const savedContrast = Number.parseInt(localStorage.getItem(CONTRAST_KEY), 10);
let contrast = Number.isFinite(savedContrast)
  ? Math.max(MIN_CONTRAST, Math.min(MAX_CONTRAST, savedContrast))
  : DEFAULT_CONTRAST;
const savedFontIndex = FONTS.findIndex(
  (font) => font.id === localStorage.getItem(FONT_KEY)
);
let fontIndex = savedFontIndex >= 0
  ? savedFontIndex
  : FONTS.findIndex((font) => font.id === "alegreya");
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
const savedSpeechPosition = Number.parseInt(localStorage.getItem(SPEECH_POSITION_KEY), 10);
let speechMinimumLength = Number.isFinite(savedSpeechMinimum)
  ? Math.max(MIN_SPEECH_MIN_LENGTH, Math.min(MAX_SPEECH_MIN_LENGTH, savedSpeechMinimum))
  : DEFAULT_SPEECH_MIN_LENGTH;
let speechMaximumLength = Number.isFinite(savedSpeechMaximum)
  ? Math.max(MIN_SPEECH_MAX_LENGTH, Math.min(MAX_SPEECH_MAX_LENGTH, savedSpeechMaximum))
  : DEFAULT_SPEECH_MAX_LENGTH;
let speechPositionPercent = Number.isFinite(savedSpeechPosition)
  ? Math.max(
    MIN_SPEECH_POSITION_PERCENT,
    Math.min(MAX_SPEECH_POSITION_PERCENT, savedSpeechPosition)
  )
  : DEFAULT_SPEECH_POSITION_PERCENT;
if (speechMinimumLength > speechMaximumLength) {
  speechMinimumLength = Math.min(DEFAULT_SPEECH_MIN_LENGTH, speechMaximumLength);
}

const speechSessionId = (() => {
  const makeId = () => crypto.randomUUID?.().replaceAll("-", "") ||
    `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  try {
    const existing = window.sessionStorage?.getItem(SPEECH_SESSION_KEY);
    if (existing) return existing;
    const created = makeId();
    window.sessionStorage?.setItem(SPEECH_SESSION_KEY, created);
    return created;
  } catch {
    return makeId();
  }
})();
const speechAudioFormat = speechAudio.canPlayType?.('audio/ogg; codecs="opus"')
  ? "opus"
  : "wav";

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
  startReopen.disabled = isBookLoading || !canReopen;
  settingsReopen.disabled = isBookLoading || !canReopen;
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
    button.disabled = isBookLoading || !cached?.bytes;
    button.textContent = record.title && record.title !== record.fileName
      ? `${record.title} — ${record.fileName}`
      : record.fileName;
    if (cached?.thumbnail) {
      button.classList.add("has-cover");
      button.style.setProperty("--recent-book-cover", `url("${cached.thumbnail}")`);
    }
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

const createCoverThumbnail = async (bookInstance) => {
  if (
    typeof bookInstance?.coverUrl !== "function" ||
    typeof window.fetch !== "function" ||
    typeof window.createImageBitmap !== "function"
  ) return "";

  try {
    const coverUrl = await bookInstance.coverUrl();
    if (!coverUrl) return "";
    const response = await window.fetch(coverUrl);
    if (!response.ok) return "";
    const blob = await response.blob();
    if (!blob?.type?.startsWith("image/")) return "";

    const bitmap = await window.createImageBitmap(blob);
    const scale = Math.min(1, 160 / bitmap.width, 240 / bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const canvasContext = canvas.getContext?.("2d");
    if (!canvasContext) {
      bitmap.close?.();
      return "";
    }
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL?.("image/jpeg", 0.78) || "";
  } catch (error) {
    console.warn("Could not create an EPUB cover thumbnail.", error);
    return "";
  }
};

const backfillRecentThumbnails = async () => {
  let changed = false;
  for (const cached of cachedRecentBooks) {
    if (cached.thumbnail || !cached.bytes) continue;
    let coverBook = null;
    try {
      coverBook = ePub(cached.bytes);
      await coverBook.opened;
      await coverBook.ready;
      const thumbnail = await createCoverThumbnail(coverBook);
      if (thumbnail) {
        cached.thumbnail = thumbnail;
        changed = true;
        renderRecentBooks();
      }
    } catch (error) {
      console.warn("Could not inspect a cached EPUB cover.", error);
    } finally {
      coverBook?.destroy?.();
    }
  }
  if (changed) await writeCachedBooks(cachedRecentBooks);
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
    void backfillRecentThumbnails();
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

const bookSettingsKey = (hash) => `${BOOK_SETTINGS_PREFIX}${hash}`;

const captureReadingSettings = () => ({
  font: FONTS[fontIndex].id,
  fontSize: fontSizePx,
  lineHeight,
  tracking: trackingEm,
  width: widthCh,
  voice: speechVoicePreference
});

const saveCurrentReadingSettings = (globalKey = "", globalValue = "") => {
  if (suppressSettingsPersistence) return;
  if (activeBookKey) {
    localStorage.setItem(
      bookSettingsKey(activeBookKey),
      JSON.stringify(captureReadingSettings())
    );
  } else if (globalKey) {
    localStorage.setItem(globalKey, String(globalValue));
  }
};

const readBookSettings = (hash) => {
  try {
    const stored = JSON.parse(localStorage.getItem(bookSettingsKey(hash)) || "null");
    return stored && typeof stored === "object" ? stored : null;
  } catch {
    return null;
  }
};

const applyStoredBookSettings = (hash) => {
  const stored = readBookSettings(hash);
  if (!stored) {
    saveCurrentReadingSettings();
    return;
  }

  suppressSettingsPersistence = true;
  try {
    const storedFont = FONTS.findIndex((font) => font.id === stored.font);
    if (storedFont >= 0) applyFont(storedFont, false);
    if (Number.isFinite(Number(stored.fontSize))) {
      applyFontSize(Number(stored.fontSize), false);
    }
    if (Number.isFinite(Number(stored.lineHeight))) {
      applyLineHeight(Number(stored.lineHeight), false);
    }
    if (Number.isFinite(Number(stored.tracking))) {
      applyTracking(Number(stored.tracking), false);
    }
    if (Number.isFinite(Number(stored.width))) {
      applyWidth(Number(stored.width), false);
    }
    speechVoicePreference = typeof stored.voice === "string" ? stored.voice : "";
    settingsSpeechVoice.value = speechVoicePreference;
  } finally {
    suppressSettingsPersistence = false;
  }
};

const syncSettingsControls = () => {
  const paletteId = PALETTES[paletteIndex].id;
  const fontId = FONTS[fontIndex].id;
  const trackingText = `${trackingEm > 0 ? "+" : ""}${trackingEm.toFixed(2)}em`;
  const widthText = `≈ ${widthCh} chars`;
  const fontSizeText = `${fontSizePx}px`;
  const lineHeightText = lineHeight.toFixed(2);
  const contrastText = `${contrast > 0 ? "+" : ""}${contrast}%`;

  startPaletteSelect.value = paletteId;
  settingsPaletteSelect.value = paletteId;
  startContrast.value = String(contrast);
  settingsContrast.value = String(contrast);
  startContrastValue.textContent = contrastText;
  settingsContrastValue.textContent = contrastText;
  startContrastDown.disabled = contrast <= MIN_CONTRAST;
  settingsContrastDown.disabled = contrast <= MIN_CONTRAST;
  startContrastUp.disabled = contrast >= MAX_CONTRAST;
  settingsContrastUp.disabled = contrast >= MAX_CONTRAST;
  startFontSelect.value = fontId;
  settingsFontSelect.value = fontId;
  settingsTrackingValue.textContent = trackingText;
  startWidth.value = String(widthCh);
  settingsWidth.value = String(widthCh);
  startWidthValue.textContent = widthText;
  settingsWidthValue.textContent = widthText;
  startWidthDown.disabled = widthCh <= MIN_WIDTH_CH;
  settingsWidthDown.disabled = widthCh <= MIN_WIDTH_CH;
  startWidthUp.disabled = widthCh >= MAX_WIDTH_CH;
  settingsWidthUp.disabled = widthCh >= MAX_WIDTH_CH;
  startFontSize.value = String(fontSizePx);
  settingsFontSize.value = String(fontSizePx);
  startFontSizeValue.textContent = fontSizeText;
  settingsFontSizeValue.textContent = fontSizeText;
  startFontSizeDown.disabled = fontSizePx <= MIN_FONT_SIZE_PX;
  settingsFontSizeDown.disabled = fontSizePx <= MIN_FONT_SIZE_PX;
  startFontSizeUp.disabled = fontSizePx >= MAX_FONT_SIZE_PX;
  settingsFontSizeUp.disabled = fontSizePx >= MAX_FONT_SIZE_PX;
  startLineHeight.value = String(lineHeight);
  settingsLineHeight.value = String(lineHeight);
  startLineHeightValue.textContent = lineHeightText;
  settingsLineHeightValue.textContent = lineHeightText;
  startLineHeightDown.disabled = lineHeight <= MIN_LINE_HEIGHT;
  settingsLineHeightDown.disabled = lineHeight <= MIN_LINE_HEIGHT;
  startLineHeightUp.disabled = lineHeight >= MAX_LINE_HEIGHT;
  settingsLineHeightUp.disabled = lineHeight >= MAX_LINE_HEIGHT;
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

const applyContrast = (nextContrast, announce = true) => {
  contrast = Math.round(
    Math.max(MIN_CONTRAST, Math.min(MAX_CONTRAST, nextContrast))
  );
  document.documentElement.style.setProperty(
    "--contrast-strength",
    `${Math.max(0, contrast)}%`
  );
  document.documentElement.style.setProperty(
    "--contrast-soften",
    `${Math.max(0, -contrast)}%`
  );
  localStorage.setItem(CONTRAST_KEY, String(contrast));
  syncSettingsControls();

  if (announce) {
    showStatus(`CONTRAST · ${contrast > 0 ? "+" : ""}${contrast}%`, 900);
  }
};

const applyFont = (nextIndex, announce = true) => {
  const anchor = beginLayoutChange();
  fontIndex = (nextIndex + FONTS.length) % FONTS.length;
  const font = FONTS[fontIndex];
  document.documentElement.dataset.font = font.id;
  saveCurrentReadingSettings(FONT_KEY, font.id);
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
  saveCurrentReadingSettings(TRACKING_KEY, trackingEm);
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
  saveCurrentReadingSettings(WIDTH_KEY, widthCh);
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
  saveCurrentReadingSettings(FONT_SIZE_KEY, fontSizePx);
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
  saveCurrentReadingSettings(LINE_HEIGHT_KEY, lineHeight);
  syncSettingsControls();
  scheduleLayoutAnchorRestore(anchor);

  if (announce) showStatus(`LINE HEIGHT · ${lineHeight.toFixed(2)}`, 900);
};

const resetAllSettings = () => {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(BOOK_SETTINGS_PREFIX)) localStorage.removeItem(key);
  }

  const defaultPaletteIndex = PALETTES.findIndex((palette) => palette.id === "nord");
  const defaultFontIndex = FONTS.findIndex((font) => font.id === "alegreya");
  localStorage.setItem(FONT_KEY, "alegreya");
  localStorage.setItem(FONT_SIZE_KEY, String(DEFAULT_FONT_SIZE_PX));
  localStorage.setItem(LINE_HEIGHT_KEY, String(DEFAULT_LINE_HEIGHT));
  localStorage.setItem(TRACKING_KEY, String(DEFAULT_TRACKING_EM));
  localStorage.setItem(WIDTH_KEY, String(DEFAULT_WIDTH_CH));

  applyPalette(defaultPaletteIndex, false);
  applyContrast(DEFAULT_CONTRAST, false);
  applyFont(defaultFontIndex, false);
  applyFontSize(DEFAULT_FONT_SIZE_PX, false);
  applyLineHeight(DEFAULT_LINE_HEIGHT, false);
  applyTracking(DEFAULT_TRACKING_EM, false);
  applyWidth(DEFAULT_WIDTH_CH, false);
  speechVoicePreference = "";
  settingsSpeechVoice.value = "";
  applySpeechBounds(
    DEFAULT_SPEECH_MIN_LENGTH,
    DEFAULT_SPEECH_MAX_LENGTH
  );
  applySpeechPosition(DEFAULT_SPEECH_POSITION_PERCENT, Boolean(speechActiveJob));
  saveCurrentReadingSettings();
  showStatus("ALL SETTINGS RESET · BOOKS AND POSITIONS KEPT", 1800);
};

applyPalette(paletteIndex, false);
applyContrast(contrast, false);
applyFont(fontIndex, false);
applyTracking(trackingEm, false);
applyWidth(widthCh, false);
applyFontSize(fontSizePx, false);
applyLineHeight(lineHeight, false);
if (recentBookInfo[0]?.hash && readBookSettings(recentBookInfo[0].hash)) {
  applyStoredBookSettings(recentBookInfo[0].hash);
}

const setSettingsOpen = (isOpen) => {
  settingsPanel.hidden = !isOpen;
  document.body.classList[isOpen ? "add" : "remove"]("settings-open");
  settingsToggle.setAttribute("aria-expanded", String(isOpen));
  settingsToggle.setAttribute(
    "aria-label", isOpen ? "Close reader settings" : "Open reader settings"
  );
  settingsToggle.title = isOpen ? "Close reader settings" : "Reader settings";
};

const setReadingMode = (isReading) => {
  dropZone.hidden = isReading;
  reader.hidden = !isReading;
  settingsMenu.hidden = !isReading;
  readingProgress.hidden = !isReading;
  if (!isReading) setSettingsOpen(false);
  syncSpeechControls();
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
  if (positionPersistenceSuspended || !activeBookKey || reader.hidden) return;

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
  if (positionPersistenceSuspended) return;
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
  lastPointerType = event.pointerType || "mouse";
  cancelSpeechScroll();
  if (
    event.button !== 2 ||
    reader.hidden ||
    event.target?.closest?.("#settings-menu, #speech-controls")
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
  await new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });

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
  settingsSpeechMinDown.disabled = minimum <= MIN_SPEECH_MIN_LENGTH;
  settingsSpeechMinUp.disabled = minimum >= MAX_SPEECH_MIN_LENGTH;
  settingsSpeechMaxDown.disabled = maximum <= MIN_SPEECH_MAX_LENGTH;
  settingsSpeechMaxUp.disabled = maximum >= MAX_SPEECH_MAX_LENGTH;
};

applySpeechBounds(speechMinimumLength, speechMaximumLength);

const applySpeechPosition = (nextPosition, followCurrent = false) => {
  speechPositionPercent = Math.round(Math.max(
    MIN_SPEECH_POSITION_PERCENT,
    Math.min(MAX_SPEECH_POSITION_PERCENT, nextPosition)
  ));
  localStorage.setItem(SPEECH_POSITION_KEY, String(speechPositionPercent));
  settingsSpeechPosition.value = String(speechPositionPercent);
  settingsSpeechPositionValue.textContent = `${speechPositionPercent}%`;
  settingsSpeechPositionDown.disabled = (
    speechPositionPercent <= MIN_SPEECH_POSITION_PERCENT
  );
  settingsSpeechPositionUp.disabled = (
    speechPositionPercent >= MAX_SPEECH_POSITION_PERCENT
  );
  if (followCurrent && speechActiveJob) positionSpeechMarker(true);
};

applySpeechPosition(speechPositionPercent);

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
  const groups = [];
  let start = 0;
  while (start < totalLength) {
    while (start < totalLength && /\s/.test(source.text[start])) start += 1;
    if (start >= totalLength) break;

    const hardEnd = Math.min(totalLength, start + maximum);
    let end = hardEnd;
    if (hardEnd < totalLength) {
      const minimumEnd = Math.min(hardEnd, start + minimum);
      const windowText = source.text.slice(start, hardEnd);
      const findLastPunctuationEnd = (pattern) => {
        let foundEnd = -1;
        for (const match of windowText.matchAll(pattern)) {
          const candidateEnd = start + match.index + match[0].length;
          if (candidateEnd >= minimumEnd) foundEnd = candidateEnd;
        }
        return foundEnd;
      };
      const strongEnd = findLastPunctuationEnd(/[.!?]+["'’”)]*/g);
      const softEnd = strongEnd < 0
        ? findLastPunctuationEnd(/[,;:]+["'’”)]*/g)
        : -1;
      const punctuationEnd = strongEnd >= 0 ? strongEnd : softEnd;

      if (punctuationEnd >= 0) {
        end = punctuationEnd;
      } else {
        for (let index = hardEnd - 1; index >= minimumEnd; index -= 1) {
          if (/\s/.test(source.text[index])) {
            end = index;
            break;
          }
        }
      }
    }

    while (end > start && /\s/.test(source.text[end - 1])) end -= 1;
    if (end <= start) end = hardEnd;
    groups.push({ start, end });
    start = end;
  }

  const jobs = groups.map(({ start, end }) => {
    let text = source.text.slice(start, end).trim();
    if (!/[.!?,;:]["'’”)]*$/.test(text) && text.length < maximum) text += ".";
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

const cancelSpeechScroll = () => {
  if (speechScrollFrame === null) return;
  window.cancelAnimationFrame(speechScrollFrame);
  speechScrollFrame = null;
};

const animateSpeechScrollBy = (offset) => {
  cancelSpeechScroll();
  if (!Number.isFinite(offset) || Math.abs(offset) <= 1) return;

  const startY = window.scrollY || 0;
  const scrollLimit = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const targetY = Math.max(0, Math.min(scrollLimit, startY + offset));
  const distance = targetY - startY;
  if (Math.abs(distance) <= 1) return;

  let startTime = null;
  const step = (time) => {
    if (startTime === null) startTime = time;
    const progress = Math.min(1, (time - startTime) / SPEECH_SCROLL_DURATION_MS);
    const eased = 1 - ((1 - progress) ** 3);
    window.scrollTo({
      top: startY + distance * eased,
      left: 0,
      behavior: "auto"
    });
    if (progress < 1) {
      speechScrollFrame = window.requestAnimationFrame(step);
    } else {
      speechScrollFrame = null;
    }
  };

  speechScrollFrame = window.requestAnimationFrame(step);
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

    const scrollOffset = firstRect.top - window.innerHeight * (speechPositionPercent / 100);
    if (followText && Math.abs(scrollOffset) > 1) {
      animateSpeechScrollBy(scrollOffset);
    }
  } else {
    speechActiveElements = [...new Set(
      (speechActiveJob.segments || []).map((segment) => segment.element).filter(Boolean)
    )];
    speechActiveElements.forEach((element) => element.classList?.add("speech-active"));
  }

  const rect = firstElement?.getBoundingClientRect?.();
  if (followText && rects.length === 0 && rect) {
    const fallbackOffset = rect.top - window.innerHeight * (speechPositionPercent / 100);
    if (Math.abs(fallbackOffset) > 1) {
      animateSpeechScrollBy(fallbackOffset);
    }
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
  cancelSpeechScroll();
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
  const selected = speechVoicePreference;
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
  speechVoicePreference = voices.includes(selected) ? selected : "";
  settingsSpeechVoice.value = speechVoicePreference;
  if (selected && !speechVoicePreference) saveCurrentReadingSettings();
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
  if (!bridge.available) throw new Error(bridge.error || "Piper or FFmpeg was not found.");
  updateSpeechVoices(bridge.voices || []);
  const format = speechAudioFormat === "opus" ? "Opus 48 kbps" : "WAV compatibility mode";
  settingsSpeechStatus.textContent = `${bridge.voices.length} local voice${bridge.voices.length === 1 ? "" : "s"} ready · ${format}.`;
  return bridge;
};

const formatSpeechVoice = (prepared) => {
  const voiceName = prepared.voice?.replace(/\.onnx$/i, "") || "Piper";
  const speakerId = Number.isInteger(prepared.speaker) ? prepared.speaker : 0;
  return Number(prepared.speakerCount) > 1
    ? `${voiceName}/${speakerId}`
    : voiceName;
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

const clearSpeechIndicators = () => {
  speechVoice.hidden = true;
  speechVoice.textContent = "";
  speechProgress.hidden = true;
  speechProgress.textContent = "";
};

const syncSpeechControls = () => {
  const bookCanSpeak = !reader.hidden && viewer.children.length > 0 && !isBookLoading;
  const canPause = speechIsActive && Boolean(speechAudio.src);
  settingsSpeechStart.disabled = speechIsActive;
  settingsSpeechPause.disabled = !canPause;
  settingsSpeechPause.textContent = speechIsPaused ? "CONTINUE" : "PAUSE";
  settingsSpeechStop.disabled = !speechIsActive;
  speechControls.hidden = reader.hidden;
  speechOverlayPause.hidden = !piperAvailable;
  speechOverlayStop.hidden = !piperAvailable;
  speechOverlayPause.disabled = speechIsActive ? !canPause : !bookCanSpeak;
  speechOverlayStop.disabled = !speechIsActive;
  speechOverlayHome.disabled = isBookLoading;
  speechOverlayPause.textContent = speechIsActive && !speechIsPaused ? "Ⅱ" : "▶";
  const primaryLabel = speechIsActive
    ? (speechIsPaused ? "Continue speech" : "Pause speech")
    : "Read aloud from here";
  speechOverlayPause.setAttribute(
    "aria-label", primaryLabel
  );
  speechOverlayPause.title = primaryLabel;
};

const probePiperBridge = async () => {
  try {
    await inspectPiperBridge();
    piperAvailable = true;
  } catch {
    piperAvailable = false;
    settingsSpeechStatus.textContent = "Run piper_bridge.py to enable local speech.";
  } finally {
    syncSpeechControls();
  }
};

const releaseSpeechAudio = () => {
  speechAudioFinish?.();
  speechAudioFinish = null;
  speechAudio.pause();
  speechAudio.onended = null;
  speechAudio.onerror = null;
  speechAudio.removeAttribute("src");
  speechAudio.load();
  syncSpeechControls();
};

const unlockSpeechAudio = () => {
  speechAudio.muted = true;
  speechAudio.src = SILENT_WAV_DATA_URL;
  speechAudio.load();
  speechAudioUnlockPromise = Promise.resolve(speechAudio.play())
    .catch(() => {})
    .finally(() => {
      if (speechAudio.src === SILENT_WAV_DATA_URL) {
        speechAudio.pause();
        speechAudio.removeAttribute("src");
        speechAudio.load();
      }
      speechAudio.muted = false;
    });
};

const playPreparedAudio = async (prepared) => {
  await speechAudioUnlockPromise;
  releaseSpeechAudio();
  speechAudio.muted = false;
  speechAudio.src = prepared.audioUrl;
  speechAudio.load();
  syncSpeechControls();

  let finishPlayback;
  const finished = new Promise((resolve, reject) => {
    let settled = false;
    finishPlayback = (error = null) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };
    speechAudio.onended = () => finishPlayback();
    speechAudio.onerror = () => finishPlayback(new Error("Browser audio playback failed."));
  });
  speechAudioFinish = () => finishPlayback();

  try {
    await speechAudio.play();
    await finished;
  } catch (error) {
    finishPlayback();
    throw error;
  } finally {
    if (speechAudioFinish) speechAudioFinish = null;
    speechAudio.pause();
    speechAudio.onended = null;
    speechAudio.onerror = null;
    speechAudio.removeAttribute("src");
    speechAudio.load();
  }
};

const stopSpeech = () => {
  const wasActive = speechIsActive;
  speechGeneration += 1;
  speechIsActive = false;
  speechIsPaused = false;
  clearSpeechIndicators();
  releaseSpeechAudio();
  clearSpeechSelection();
  syncSpeechControls();

  if (wasActive && typeof window.fetch === "function") {
    window.fetch("/api/piper/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: speechSessionId }),
      keepalive: true
    }).catch(() => {});
    settingsSpeechStatus.textContent = "Stopped.";
  }
};

const toggleSpeechPause = async () => {
  if (!speechIsActive || !speechAudio.src) return;
  const nextPaused = !speechIsPaused;
  try {
    if (nextPaused) speechAudio.pause();
    else await speechAudio.play();
    speechIsPaused = nextPaused;
    syncSpeechControls();
    settingsSpeechStatus.textContent = speechIsPaused
      ? "Playback paused; background generation may continue."
      : "Playback continuing…";
  } catch (error) {
    const message = error?.message || "Piper pause control failed.";
    settingsSpeechStatus.textContent = message;
    showStatus(`PIPER ERROR · ${message}`, 2200);
  }
};

const startSpeech = async () => {
  if (reader.hidden || viewer.children.length === 0 || speechIsActive) return;
  unlockSpeechAudio();
  const generation = ++speechGeneration;
  speechIsActive = true;
  speechIsPaused = false;
  syncSpeechControls();
  settingsSpeechStatus.textContent = "Connecting to local Piper…";

  try {
    if (!piperAvailable) {
      await inspectPiperBridge();
      piperAvailable = true;
      syncSpeechControls();
    }
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
    speechProgress.textContent = `1/${jobs.length}`;
    speechProgress.hidden = false;

    const requestedVoice = speechVoicePreference || null;
    const prepareJob = (job) => requestPiper("/api/piper/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: job.text,
        voice: requestedVoice,
        sessionId: speechSessionId,
        audioFormat: speechAudioFormat
      })
    });
    const settlePreparation = (job) => prepareJob(job)
      .then((value) => ({ value }), (error) => ({ error }));

    settingsSpeechStatus.textContent = "Generating first chunk…";
    let prepared = await prepareJob(jobs[0]);

    for (let index = 0; index < jobs.length; index += 1) {
      if (generation !== speechGeneration) return;
      speechProgress.textContent = `${index + 1}/${jobs.length}`;
      const nextPreparation = index + 1 < jobs.length
        ? settlePreparation(jobs[index + 1])
        : null;
      const voiceName = prepared.voice?.replace(/\.onnx$/i, "") || "Piper";
      speechVoice.textContent = formatSpeechVoice(prepared);
      speechVoice.hidden = false;
      setSpeechActiveJob(jobs[index]);
      settingsSpeechStatus.textContent = nextPreparation
        ? `Playing with ${voiceName}; generating next…`
        : `Playing with ${voiceName}…`;
      syncSpeechControls();

      await playPreparedAudio(prepared);
      speechIsPaused = false;
      syncSpeechControls();
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
    clearSpeechIndicators();
    releaseSpeechAudio();
    clearSpeechSelection();
    syncSpeechControls();
    settingsSpeechStatus.textContent = "Finished.";
  } catch (error) {
    if (generation !== speechGeneration) return;
    speechIsActive = false;
    speechIsPaused = false;
    clearSpeechIndicators();
    releaseSpeechAudio();
    clearSpeechSelection();
    syncSpeechControls();
    const message = error?.message || "Local Piper could not read this text.";
    settingsSpeechStatus.textContent = message;
    showStatus(`PIPER ERROR · ${message}`, 3200);
  }
};

const openBook = async (file) => {
  if (!file?.name?.toLowerCase().endsWith(".epub")) {
    showStatus("Please drop an EPUB file.");
    return;
  }
  if (isBookLoading) return;

  const generation = ++loadGeneration;
  savePositionNow();
  isBookLoading = true;
  positionPersistenceSuspended = true;
  setReopenAvailability(lastBookCanReopen);
  renderRecentBooks();
  clearStatus();
  showStatus("OPENING…");

  try {
    const bytes = await file.arrayBuffer();
    const hash = await hashBook(bytes);
    if (generation !== loadGeneration) return;

    destroyCurrentBook();
    activeBookKey = hash;
    applyStoredBookSettings(hash);
    const savedPosition = loadPosition(hash);

    book = ePub(bytes);
    await book.opened;
    await book.ready;
    if (generation !== loadGeneration) return;
    const coverThumbnailPromise = createCoverThumbnail(book);

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

    const [metadata, thumbnail] = await Promise.all([
      book.loaded.metadata,
      coverThumbnailPromise
    ]);
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
      const previousCachedBook = cachedRecentBooks.find((record) =>
        booksMatch(lastBookInfo, record)
      );
      const cachedBook = {
        ...lastBookInfo,
        bytes,
        thumbnail: thumbnail || previousCachedBook?.thumbnail || ""
      };
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
  } finally {
    if (generation === loadGeneration) {
      positionPersistenceSuspended = false;
      isBookLoading = false;
      renderRecentBooks();
      setReopenAvailability(lastBookCanReopen);
      syncSpeechControls();
      schedulePositionSave();
    }
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
  if (isBookLoading) return;
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
  if (isBookLoading) return;
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
  if (isBookLoading) return;
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
    if (!isBookLoading) reopenLastBook();
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
speechOverlayPause.addEventListener("click", () => {
  if (speechIsActive) void toggleSpeechPause();
  else void startSpeech();
});
speechOverlayStop.addEventListener("click", stopSpeech);
speechOverlayHome.addEventListener("click", returnToHomeScreen);
settingsSpeechVoice.addEventListener("change", (event) => {
  speechVoicePreference = event.target.value || "";
  saveCurrentReadingSettings();
});

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
settingsSpeechPosition.addEventListener("input", (event) => {
  applySpeechPosition(Number(event.target.value), true);
});
settingsSpeechMinDown.addEventListener("click", () => {
  applySpeechBounds(
    speechMinimumLength - 50,
    speechMaximumLength,
    "minimum",
    true
  );
});
settingsSpeechMinUp.addEventListener("click", () => {
  applySpeechBounds(
    speechMinimumLength + 50,
    speechMaximumLength,
    "minimum",
    true
  );
});
settingsSpeechMaxDown.addEventListener("click", () => {
  applySpeechBounds(
    speechMinimumLength,
    speechMaximumLength - 50,
    "maximum",
    true
  );
});
settingsSpeechMaxUp.addEventListener("click", () => {
  applySpeechBounds(
    speechMinimumLength,
    speechMaximumLength + 50,
    "maximum",
    true
  );
});
settingsSpeechPositionDown.addEventListener("click", () => {
  applySpeechPosition(speechPositionPercent - 1, true);
});
settingsSpeechPositionUp.addEventListener("click", () => {
  applySpeechPosition(speechPositionPercent + 1, true);
});

startPaletteNext.addEventListener("click", () => applyPalette(paletteIndex + 1));
startFontNext.addEventListener("click", () => applyFont(fontIndex + 1));
startPaletteSelect.addEventListener("change", (event) => {
  applyPalette(PALETTES.findIndex((palette) => palette.id === event.target.value));
});
settingsPaletteSelect.addEventListener("change", (event) => {
  applyPalette(PALETTES.findIndex((palette) => palette.id === event.target.value));
});
const handleContrastInput = (event, announce = false) => {
  applyContrast(Number(event.target.value), announce);
};
startContrast.addEventListener("input", (event) => handleContrastInput(event));
settingsContrast.addEventListener("input", (event) => handleContrastInput(event));
startContrast.addEventListener("change", (event) => handleContrastInput(event, true));
settingsContrast.addEventListener("change", (event) => handleContrastInput(event, true));
startContrastDown.addEventListener("click", () => applyContrast(contrast - 1));
settingsContrastDown.addEventListener("click", () => applyContrast(contrast - 1));
startContrastUp.addEventListener("click", () => applyContrast(contrast + 1));
settingsContrastUp.addEventListener("click", () => applyContrast(contrast + 1));
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
startFontSizeDown.addEventListener("click", () => {
  applyFontSize(fontSizePx - FONT_SIZE_STEP_PX);
});
settingsFontSizeDown.addEventListener("click", () => {
  applyFontSize(fontSizePx - FONT_SIZE_STEP_PX);
});
startFontSizeUp.addEventListener("click", () => {
  applyFontSize(fontSizePx + FONT_SIZE_STEP_PX);
});
settingsFontSizeUp.addEventListener("click", () => {
  applyFontSize(fontSizePx + FONT_SIZE_STEP_PX);
});

const handleLineHeightInput = (event, announce = false) => {
  applyLineHeight(Number(event.target.value), announce);
};
startLineHeight.addEventListener("input", (event) => handleLineHeightInput(event));
settingsLineHeight.addEventListener("input", (event) => handleLineHeightInput(event));
startLineHeight.addEventListener("change", (event) => handleLineHeightInput(event, true));
settingsLineHeight.addEventListener("change", (event) => handleLineHeightInput(event, true));
startLineHeightDown.addEventListener("click", () => {
  applyLineHeight(lineHeight - LINE_HEIGHT_STEP);
});
settingsLineHeightDown.addEventListener("click", () => {
  applyLineHeight(lineHeight - LINE_HEIGHT_STEP);
});
startLineHeightUp.addEventListener("click", () => {
  applyLineHeight(lineHeight + LINE_HEIGHT_STEP);
});
settingsLineHeightUp.addEventListener("click", () => {
  applyLineHeight(lineHeight + LINE_HEIGHT_STEP);
});

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
startWidthDown.addEventListener("click", () => applyWidth(widthCh - 2));
settingsWidthDown.addEventListener("click", () => applyWidth(widthCh - 2));
startWidthUp.addEventListener("click", () => applyWidth(widthCh + 2));
settingsWidthUp.addEventListener("click", () => applyWidth(widthCh + 2));

settingsToggle.addEventListener("click", () => {
  setSettingsOpen(settingsPanel.hidden);
});
settingsHome.addEventListener("click", returnToHomeScreen);
settingsPageUp.addEventListener("click", () => scrollOnePage(-1));
settingsPageDown.addEventListener("click", () => scrollOnePage(1));
startResetAll.addEventListener("click", resetAllSettings);
settingsResetAll.addEventListener("click", resetAllSettings);

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
window.addEventListener("wheel", cancelSpeechScroll, { passive: true });
window.addEventListener("touchstart", cancelSpeechScroll, { passive: true });
window.addEventListener("pointermove", handleRightDragMove);
window.addEventListener("pointerup", stopRightDrag);
window.addEventListener("pointercancel", stopRightDrag);
window.addEventListener("lostpointercapture", stopRightDrag);
window.addEventListener("contextmenu", (event) => {
  if (!reader.hidden && lastPointerType !== "touch") event.preventDefault();
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
syncSpeechControls();
void probePiperBridge();
