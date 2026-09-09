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
const startExportLibrary = document.querySelector("#start-export-library");
const startImportLibrary = document.querySelector("#start-import-library");
const libraryImportInput = document.querySelector("#library-import-input");
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
const settingsSpeechSpeakerRow = document.querySelector("#settings-speech-speaker-row");
const settingsSpeechSpeaker = document.querySelector("#settings-speech-speaker");
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
const settingsOpen = document.querySelector("#settings-open");
const settingsResetBook = document.querySelector("#settings-reset-book");
const readingProgress = document.querySelector("#reading-progress");
const speechVoice = document.querySelector("#speech-voice");
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
const SPEECH_MAX_KEY = "smooth-reader:speech-maximum";
const LEGACY_SPEECH_POSITION_KEY = "smooth-reader:speech-position";
const SPEECH_CENTER_OFFSET_KEY = "smooth-reader:speech-center-offset";
const SPEECH_SESSION_KEY = "smooth-reader:speech-session";
const SILENT_WAV_DATA_URL = "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
const LAST_BOOK_KEY = "smooth-reader:last-book";
const RECENT_BOOKS_KEY = "smooth-reader:recent-books";
const LAST_BOOK_DB = "smooth-reader-library";
const LAST_BOOK_STORE = "books";
const LAST_BOOK_RECORD = "last-opened";
const RECENT_BOOKS_RECORD = "recent-books";
const MAX_RECENT_BOOKS = 12;
const COVER_THUMBNAIL_VERSION = 2;
const COVER_THUMBNAIL_MAX_WIDTH = 600;
const COVER_THUMBNAIL_MAX_HEIGHT = 900;
const COVER_THUMBNAIL_QUALITY = 0.86;
const LIBRARY_BACKUP_FORMAT = "smooth-reader-library";
const LIBRARY_BACKUP_VERSION = 1;
const MAX_LIBRARY_IMPORT_BYTES = 512 * 1024 * 1024;
const HISTORY_APP = "smooth-reader";
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
const DEFAULT_SPEECH_MAX_LENGTH = 550;
const MIN_SPEECH_MAX_LENGTH = 300;
const MAX_SPEECH_MAX_LENGTH = 1200;
const LEGACY_DEFAULT_SPEECH_POSITION_PERCENT = 22;
const DEFAULT_SPEECH_CENTER_OFFSET_PERCENT = 0;
const MIN_SPEECH_CENTER_OFFSET_PERCENT = -25;
const MAX_SPEECH_CENTER_OFFSET_PERCENT = 25;
const SPEECH_VIEWPORT_MARGIN_PX = 16;
const SPEECH_SCROLL_DURATION_MS = 10;
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
let activeBookTitle = "";
let readerScrollBeforeHome = 0;
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
let stableResizeAnchor = null;
let activeResizeAnchor = null;
let resizeAnchorFrame = null;
let resizeEndTimer = null;
let resizeCaptureTimer = null;
let speechGeneration = 0;
let speechIsActive = false;
let speechIsPaused = false;
let speechActiveJob = null;
let speechActiveElements = [];
let speechAudioFinish = null;
let speechAudioUnlockPromise = Promise.resolve();
let speechMarkerFrame = null;
let speechScrollFrame = null;
let speechScrollTargetY = null;
let speechTextMaps = new WeakMap();
let speechVoicePreference = "";
let speechSpeakerPreference = "";
let speechVoiceDetails = new Map();
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
const savedSpeechMaximum = Number.parseInt(localStorage.getItem(SPEECH_MAX_KEY), 10);
const savedSpeechCenterOffset = Number.parseInt(
  localStorage.getItem(SPEECH_CENTER_OFFSET_KEY),
  10
);
const savedLegacySpeechPosition = Number.parseInt(
  localStorage.getItem(LEGACY_SPEECH_POSITION_KEY),
  10
);
let speechMinimumLength = DEFAULT_SPEECH_MIN_LENGTH;
let speechMaximumLength = Number.isFinite(savedSpeechMaximum)
  ? Math.max(MIN_SPEECH_MAX_LENGTH, Math.min(MAX_SPEECH_MAX_LENGTH, savedSpeechMaximum))
  : DEFAULT_SPEECH_MAX_LENGTH;
const initialSpeechCenterOffset = Number.isFinite(savedSpeechCenterOffset)
  ? savedSpeechCenterOffset
  : Number.isFinite(savedLegacySpeechPosition)
    ? savedLegacySpeechPosition - LEGACY_DEFAULT_SPEECH_POSITION_PERCENT
    : DEFAULT_SPEECH_CENTER_OFFSET_PERCENT;
let speechCenterOffsetPercent = Math.max(
  MIN_SPEECH_CENTER_OFFSET_PERCENT,
  Math.min(MAX_SPEECH_CENTER_OFFSET_PERCENT, initialSpeechCenterOffset)
);

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
    const scale = Math.min(
      1,
      COVER_THUMBNAIL_MAX_WIDTH / bitmap.width,
      COVER_THUMBNAIL_MAX_HEIGHT / bitmap.height
    );
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
    canvasContext.imageSmoothingEnabled = true;
    canvasContext.imageSmoothingQuality = "high";
    canvasContext.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL?.("image/jpeg", COVER_THUMBNAIL_QUALITY) || "";
  } catch (error) {
    console.warn("Could not create an EPUB cover thumbnail.", error);
    return "";
  }
};

const backfillRecentThumbnails = async () => {
  if (
    typeof window.fetch !== "function" ||
    typeof window.createImageBitmap !== "function"
  ) return;

  let changed = false;
  for (const cached of cachedRecentBooks) {
    if (
      !cached.bytes ||
      (cached.thumbnail && cached.thumbnailVersion === COVER_THUMBNAIL_VERSION)
    ) continue;
    let coverBook = null;
    try {
      coverBook = ePub(cached.bytes);
      await coverBook.opened;
      await coverBook.ready;
      const thumbnail = await createCoverThumbnail(coverBook);
      if (thumbnail) {
        cached.thumbnail = thumbnail;
        renderRecentBooks();
      }
      cached.thumbnailVersion = COVER_THUMBNAIL_VERSION;
      changed = true;
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

const recentBooksReady = initializeRecentBooks();

const populateSelect = (select, choices) => {
  choices.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.id;
    option.textContent = choice.name;
    select.appendChild(option);
  });
};

populateSelect(settingsPaletteSelect, PALETTES);
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

const captureStableResizeAnchor = () => {
  stableResizeAnchor = captureLayoutAnchor();
};

const scheduleStableResizeAnchorCapture = () => {
  window.clearTimeout(resizeCaptureTimer);
  if (activeResizeAnchor || reader.hidden) return;
  resizeCaptureTimer = window.setTimeout(captureStableResizeAnchor, 80);
};

const handleViewportResize = () => {
  scheduleSpeechMarkerRefresh();
  if (reader.hidden || viewer.children.length === 0) return;
  if (!activeResizeAnchor) {
    activeResizeAnchor = stableResizeAnchor || captureLayoutAnchor();
  }
  const anchor = activeResizeAnchor;
  if (resizeAnchorFrame !== null) window.cancelAnimationFrame(resizeAnchorFrame);
  resizeAnchorFrame = window.requestAnimationFrame(() => {
    resizeAnchorFrame = null;
    const currentTop = getAnchorViewportTop(anchor);
    if (!Number.isFinite(currentTop)) return;
    const correction = currentTop - anchor.viewportTop;
    if (Math.abs(correction) > 0.5) {
      window.scrollBy({ top: correction, left: 0, behavior: "auto" });
    }
    updateReadingProgress();
    schedulePositionSave();
  });

  window.clearTimeout(resizeEndTimer);
  resizeEndTimer = window.setTimeout(() => {
    activeResizeAnchor = null;
    captureStableResizeAnchor();
  }, 160);
};

const bookSettingsKey = (hash) => `${BOOK_SETTINGS_PREFIX}${hash}`;

const captureReadingSettings = () => ({
  palette: PALETTES[paletteIndex].id,
  contrast,
  font: FONTS[fontIndex].id,
  fontSize: fontSizePx,
  lineHeight,
  tracking: trackingEm,
  width: widthCh,
  voice: speechVoicePreference,
  speaker: speechSpeakerPreference,
  speechMaximum: speechMaximumLength,
  speechCenterOffset: speechCenterOffsetPercent
});

const saveCurrentReadingSettings = (fallbackKey = "", fallbackValue = "") => {
  if (suppressSettingsPersistence) return;
  if (activeBookKey) {
    localStorage.setItem(
      bookSettingsKey(activeBookKey),
      JSON.stringify(captureReadingSettings())
    );
  } else if (fallbackKey) {
    localStorage.setItem(fallbackKey, String(fallbackValue));
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
    const paletteId = typeof stored.palette === "string"
      ? stored.palette
      : localStorage.getItem(PALETTE_KEY);
    const storedPalette = PALETTES.findIndex((palette) => palette.id === paletteId);
    if (storedPalette >= 0) applyPalette(storedPalette, false);
    const storedContrast = stored.contrast ?? localStorage.getItem(CONTRAST_KEY);
    if (storedContrast !== null && storedContrast !== "" &&
        Number.isFinite(Number(storedContrast))) {
      applyContrast(Number(storedContrast), false);
    }
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
    const storedSpeaker = String(stored.speaker ?? "");
    speechSpeakerPreference = /^\d+$/.test(storedSpeaker) ? storedSpeaker : "";
    settingsSpeechVoice.value = speechVoicePreference;
    syncSpeechSpeakerOptions();
    const storedSpeechMaximum = stored.speechMaximum ?? localStorage.getItem(SPEECH_MAX_KEY);
    if (storedSpeechMaximum !== null && storedSpeechMaximum !== "" &&
        Number.isFinite(Number(storedSpeechMaximum))) {
      applySpeechBounds(DEFAULT_SPEECH_MIN_LENGTH, Number(storedSpeechMaximum));
    }
    const storedSpeechOffset = stored.speechCenterOffset ??
      localStorage.getItem(SPEECH_CENTER_OFFSET_KEY);
    if (storedSpeechOffset !== null && storedSpeechOffset !== "" &&
        Number.isFinite(Number(storedSpeechOffset))) {
      applySpeechCenterOffset(
        Number(storedSpeechOffset),
        Boolean(speechActiveJob)
      );
    }
  } finally {
    suppressSettingsPersistence = false;
  }
  saveCurrentReadingSettings();
};

const syncSettingsControls = () => {
  const paletteId = PALETTES[paletteIndex].id;
  const fontId = FONTS[fontIndex].id;
  const trackingText = `${trackingEm > 0 ? "+" : ""}${trackingEm.toFixed(2)}em`;
  const widthText = `≈ ${widthCh} chars`;
  const fontSizeText = `${fontSizePx}px`;
  const lineHeightText = lineHeight.toFixed(2);
  const contrastText = `${contrast > 0 ? "+" : ""}${contrast}%`;

  settingsPaletteSelect.value = paletteId;
  settingsContrast.value = String(contrast);
  settingsContrastValue.textContent = contrastText;
  settingsContrastDown.disabled = contrast <= MIN_CONTRAST;
  settingsContrastUp.disabled = contrast >= MAX_CONTRAST;
  settingsFontSelect.value = fontId;
  settingsTrackingValue.textContent = trackingText;
  settingsWidth.value = String(widthCh);
  settingsWidthValue.textContent = widthText;
  settingsWidthDown.disabled = widthCh <= MIN_WIDTH_CH;
  settingsWidthUp.disabled = widthCh >= MAX_WIDTH_CH;
  settingsFontSize.value = String(fontSizePx);
  settingsFontSizeValue.textContent = fontSizeText;
  settingsFontSizeDown.disabled = fontSizePx <= MIN_FONT_SIZE_PX;
  settingsFontSizeUp.disabled = fontSizePx >= MAX_FONT_SIZE_PX;
  settingsLineHeight.value = String(lineHeight);
  settingsLineHeightValue.textContent = lineHeightText;
  settingsLineHeightDown.disabled = lineHeight <= MIN_LINE_HEIGHT;
  settingsLineHeightUp.disabled = lineHeight >= MAX_LINE_HEIGHT;
};

const applyPalette = (nextIndex, announce = true) => {
  paletteIndex = (nextIndex + PALETTES.length) % PALETTES.length;
  const palette = PALETTES[paletteIndex];
  document.documentElement.dataset.palette = palette.id;
  saveCurrentReadingSettings(PALETTE_KEY, palette.id);
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
  saveCurrentReadingSettings(CONTRAST_KEY, contrast);
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

const resetCurrentBookSettings = () => {
  if (!activeBookKey) return;

  const defaultFontIndex = FONTS.findIndex((font) => font.id === "alegreya");
  suppressSettingsPersistence = true;
  try {
    const defaultPaletteIndex = PALETTES.findIndex((palette) => palette.id === "nord");
    applyPalette(defaultPaletteIndex, false);
    applyContrast(DEFAULT_CONTRAST, false);
    applyFont(defaultFontIndex, false);
    applyFontSize(DEFAULT_FONT_SIZE_PX, false);
    applyLineHeight(DEFAULT_LINE_HEIGHT, false);
    applyTracking(DEFAULT_TRACKING_EM, false);
    applyWidth(DEFAULT_WIDTH_CH, false);
    speechVoicePreference = "";
    speechSpeakerPreference = "";
    settingsSpeechVoice.value = "";
    syncSpeechSpeakerOptions();
    applySpeechBounds(DEFAULT_SPEECH_MIN_LENGTH, DEFAULT_SPEECH_MAX_LENGTH);
    applySpeechCenterOffset(
      DEFAULT_SPEECH_CENTER_OFFSET_PERCENT,
      Boolean(speechActiveJob)
    );
  } finally {
    suppressSettingsPersistence = false;
  }
  saveCurrentReadingSettings();
  showStatus("ALL SETTINGS FOR THIS BOOK RESET · POSITION KEPT", 1800);
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

const storageSnapshot = () => {
  const values = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("smooth-reader:")) continue;
    const value = localStorage.getItem(key);
    if (value !== null) values[key] = value;
  }
  return values;
};

const bookMetadataOnly = (record) => {
  const { bytes, epubPath, ...metadata } = record || {};
  return metadata;
};

const recentMetadataOnly = (record) => {
  const { bytes, epubPath, thumbnail, thumbnailVersion, ...metadata } = record || {};
  return metadata;
};

const recordOpenedAt = (record) => {
  const openedAt = Number(record?.openedAt);
  return Number.isFinite(openedAt) ? openedAt : 0;
};

const mergeBookCollections = (existingRecords, importedRecords) => {
  const merged = (existingRecords || []).map((record) => ({ ...record }));
  for (const imported of importedRecords || []) {
    if (!imported?.fileName && !imported?.hash) continue;
    const index = merged.findIndex((record) => booksMatch(record, imported));
    if (index < 0) {
      merged.push({ ...imported });
      continue;
    }

    const existing = merged[index];
    merged[index] = {
      ...imported,
      ...existing,
      fileName: existing.fileName || imported.fileName,
      title: existing.title || imported.title,
      openedAt: Math.max(recordOpenedAt(existing), recordOpenedAt(imported)),
      bytes: existing.bytes || imported.bytes,
      thumbnail: existing.thumbnail || imported.thumbnail,
      thumbnailVersion: existing.thumbnail
        ? existing.thumbnailVersion
        : imported.thumbnailVersion
    };
  }
  return merged
    .sort((first, second) => recordOpenedAt(second) - recordOpenedAt(first))
    .slice(0, MAX_RECENT_BOOKS);
};

const positionSavedAt = (value) => {
  try {
    const savedAt = Number(JSON.parse(value)?.savedAt);
    return Number.isFinite(savedAt) ? savedAt : 0;
  } catch {
    return 0;
  }
};

const mergeImportedStorage = (importedValues) => {
  if (!importedValues || typeof importedValues !== "object") return;
  for (const [key, value] of Object.entries(importedValues)) {
    if (
      !key.startsWith("smooth-reader:") ||
      typeof value !== "string" ||
      key === RECENT_BOOKS_KEY ||
      key === LAST_BOOK_KEY
    ) continue;

    if (key.startsWith(POSITION_PREFIX)) {
      const existing = localStorage.getItem(key);
      if (existing && positionSavedAt(existing) > positionSavedAt(value)) continue;
    }
    localStorage.setItem(key, value);
  }
};

const importedRecentMetadata = (manifest) => {
  try {
    const storedRecent = JSON.parse(manifest.localStorage?.[RECENT_BOOKS_KEY] || "null");
    if (Array.isArray(storedRecent)) return storedRecent;
  } catch {
    // Fall back to the book records in the manifest.
  }
  return (manifest.books || []).map(recentMetadataOnly);
};

const applyImportedSettings = () => {
  if (activeBookKey) {
    applyStoredBookSettings(activeBookKey);
  } else {
    const importedPaletteIndex = PALETTES.findIndex(
      (palette) => palette.id === localStorage.getItem(PALETTE_KEY)
    );
    const importedContrast = Number.parseInt(localStorage.getItem(CONTRAST_KEY), 10);
    const importedSpeechMaximum = Number.parseInt(localStorage.getItem(SPEECH_MAX_KEY), 10);
    const importedSpeechOffset = Number.parseInt(
      localStorage.getItem(SPEECH_CENTER_OFFSET_KEY),
      10
    );
    const importedFontIndex = FONTS.findIndex(
      (font) => font.id === localStorage.getItem(FONT_KEY)
    );
    suppressSettingsPersistence = true;
    try {
      if (importedPaletteIndex >= 0) applyPalette(importedPaletteIndex, false);
      if (Number.isFinite(importedContrast)) applyContrast(importedContrast, false);
      applySpeechBounds(
        DEFAULT_SPEECH_MIN_LENGTH,
        Number.isFinite(importedSpeechMaximum)
          ? importedSpeechMaximum
          : DEFAULT_SPEECH_MAX_LENGTH
      );
      if (Number.isFinite(importedSpeechOffset)) {
        applySpeechCenterOffset(importedSpeechOffset, Boolean(speechActiveJob));
      }
      if (importedFontIndex >= 0) applyFont(importedFontIndex, false);
      const importedFontSize = Number.parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
      const importedLineHeight = Number.parseFloat(localStorage.getItem(LINE_HEIGHT_KEY));
      const importedTracking = Number.parseFloat(localStorage.getItem(TRACKING_KEY));
      const importedWidth = Number.parseInt(localStorage.getItem(WIDTH_KEY), 10);
      if (Number.isFinite(importedFontSize)) applyFontSize(importedFontSize, false);
      if (Number.isFinite(importedLineHeight)) applyLineHeight(importedLineHeight, false);
      if (Number.isFinite(importedTracking)) applyTracking(importedTracking, false);
      if (Number.isFinite(importedWidth)) applyWidth(importedWidth, false);
    } finally {
      suppressSettingsPersistence = false;
    }
  }
};

const exportLibrary = async () => {
  if (isBookLoading) return;
  try {
    showStatus("CREATING LIBRARY BACKUP…");
    await recentBooksReady;
    savePositionNow();
    if (typeof window.JSZip !== "function") {
      throw new Error("ZIP support is unavailable");
    }

    const archive = new window.JSZip();
    const manifest = {
      format: LIBRARY_BACKUP_FORMAT,
      version: LIBRARY_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      localStorage: storageSnapshot(),
      books: []
    };

    cachedRecentBooks.forEach((record, index) => {
      const metadata = bookMetadataOnly(record);
      if (record.bytes) {
        metadata.epubPath = `books/${String(index + 1).padStart(2, "0")}-${
          String(record.hash || "book").slice(0, 16)
        }.epub`;
        archive.file(metadata.epubPath, record.bytes, {
          binary: true,
          compression: "STORE"
        });
      }
      manifest.books.push(metadata);
    });

    archive.file("manifest.json", JSON.stringify(manifest, null, 2));
    const blob = await archive.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    const createObjectURL = window.URL?.createObjectURL;
    if (typeof createObjectURL !== "function") {
      throw new Error("Browser downloads are unavailable");
    }
    const downloadUrl = createObjectURL.call(window.URL, blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `smooth-reader-library-${new Date().toISOString().slice(0, 10)}.zip`;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 0);
    showStatus(`LIBRARY EXPORTED · ${cachedRecentBooks.length} BOOKS`, 2200);
  } catch (error) {
    console.error(error);
    showStatus(`EXPORT ERROR · ${error?.message || "Backup could not be created"}`, 3200);
  }
};

const importLibrary = async (file) => {
  if (!file || isBookLoading) return;
  try {
    showStatus("IMPORTING LIBRARY…");
    await recentBooksReady;
    if (typeof window.JSZip !== "function") {
      throw new Error("ZIP support is unavailable");
    }

    const archive = await window.JSZip.loadAsync(await file.arrayBuffer());
    const manifestEntry = archive.file("manifest.json");
    if (!manifestEntry) throw new Error("Not a Smooth Reader backup");
    const manifest = JSON.parse(await manifestEntry.async("string"));
    if (
      manifest?.format !== LIBRARY_BACKUP_FORMAT ||
      manifest.version !== LIBRARY_BACKUP_VERSION ||
      !Array.isArray(manifest.books)
    ) throw new Error("Unsupported Smooth Reader backup");

    const importedBooks = [];
    let importedBytes = 0;
    const candidates = [...manifest.books]
      .sort((first, second) => recordOpenedAt(second) - recordOpenedAt(first))
      .slice(0, MAX_RECENT_BOOKS);
    for (const [index, source] of candidates.entries()) {
      const metadata = bookMetadataOnly(source);
      const epubEntry = typeof source.epubPath === "string"
        ? archive.file(source.epubPath)
        : null;
      if (epubEntry) {
        metadata.bytes = await epubEntry.async("arraybuffer");
        importedBytes += metadata.bytes.byteLength;
        if (importedBytes > MAX_LIBRARY_IMPORT_BYTES) {
          throw new Error("Backup contains more than 512 MiB of EPUB data");
        }
      }
      metadata.fileName = metadata.fileName || `Imported book ${index + 1}.epub`;
      importedBooks.push(metadata);
    }

    mergeImportedStorage(manifest.localStorage);
    cachedRecentBooks = mergeBookCollections(cachedRecentBooks, importedBooks);
    recentBookInfo = mergeBookCollections(
      recentBookInfo,
      [
        ...importedRecentMetadata(manifest),
        ...importedBooks.map(recentMetadataOnly)
      ]
    ).map(recentMetadataOnly);
    localStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(recentBookInfo));
    if (!localStorage.getItem(LAST_BOOK_KEY) && recentBookInfo[0]) {
      localStorage.setItem(LAST_BOOK_KEY, JSON.stringify(recentBookInfo[0]));
    }
    await writeCachedBooks(cachedRecentBooks);
    lastBookCanReopen = Boolean(
      cachedRecentBooks.find((cached) => booksMatch(recentBookInfo[0], cached))?.bytes
    );
    setReopenAvailability(lastBookCanReopen);
    renderRecentBooks();
    applyImportedSettings();

    if (activeBookKey) {
      const position = loadPosition(activeBookKey);
      if (Number.isFinite(Number(position?.scrollY))) {
        readerScrollBeforeHome = Number(position.scrollY);
      }
    }
    showStatus(`LIBRARY IMPORTED · ${importedBooks.length} BOOKS MERGED`, 2600);
  } catch (error) {
    console.error(error);
    showStatus(`IMPORT ERROR · ${error?.message || "Backup could not be read"}`, 3600);
  }
};

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
  document.documentElement.dataset.view = isReading ? "reader" : "home";
  dropZone.hidden = isReading;
  reader.hidden = !isReading;
  settingsMenu.hidden = !isReading;
  readingProgress.hidden = !isReading;
  if (!isReading) setSettingsOpen(false);
  syncSpeechControls();
};

const currentAppHistoryView = () => {
  const state = window.history?.state;
  return state?.app === HISTORY_APP ? state.view : "";
};

const replaceHomeHistory = () => {
  window.history?.replaceState?.({ app: HISTORY_APP, view: "home" }, "");
};

if (window.history && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const commitReaderHistory = () => {
  if (!window.history?.pushState) return;
  const state = { app: HISTORY_APP, view: "reader", bookKey: activeBookKey };
  if (currentAppHistoryView() === "reader") window.history.replaceState(state, "");
  else window.history.pushState(state, "");
};

const showHomeView = () => {
  if (!reader.hidden) {
    savePositionNow();
    readerScrollBeforeHome = window.scrollY;
  }
  if (speechIsActive) stopSpeech();
  clearStatus();
  setReadingMode(false);
  renderRecentBooks();
  document.title = "Smooth Reader";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.requestAnimationFrame(() => {
    if (reader.hidden) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  });
};

const showReaderView = () => {
  if (!activeBookKey || viewer.children.length === 0) {
    replaceHomeHistory();
    showHomeView();
    return;
  }
  setReadingMode(true);
  document.title = activeBookTitle || "Smooth Reader";
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: readerScrollBeforeHome, left: 0, behavior: "auto" });
    captureStableResizeAnchor();
    updateReadingProgress();
  });
};

replaceHomeHistory();

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
  window.clearTimeout(resizeEndTimer);
  window.clearTimeout(resizeCaptureTimer);
  if (resizeAnchorFrame !== null) window.cancelAnimationFrame(resizeAnchorFrame);
  resizeAnchorFrame = null;
  stableResizeAnchor = null;
  activeResizeAnchor = null;
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

function applySpeechBounds(nextMinimum, nextMaximum, changed = "", announce = false) {
  const minimum = DEFAULT_SPEECH_MIN_LENGTH;
  const maximum = Math.round(Math.max(
    MIN_SPEECH_MAX_LENGTH,
    Math.min(MAX_SPEECH_MAX_LENGTH, nextMaximum)
  ));

  speechMinimumLength = minimum;
  speechMaximumLength = maximum;
  saveCurrentReadingSettings(SPEECH_MAX_KEY, maximum);
  settingsSpeechMax.value = String(maximum);
  settingsSpeechMaxValue.textContent = `${maximum} chars`;
  settingsSpeechMaxDown.disabled = maximum <= MIN_SPEECH_MAX_LENGTH;
  settingsSpeechMaxUp.disabled = maximum >= MAX_SPEECH_MAX_LENGTH;
}

applySpeechBounds(speechMinimumLength, speechMaximumLength);

function applySpeechCenterOffset(nextOffset, followCurrent = false) {
  speechCenterOffsetPercent = Math.round(Math.max(
    MIN_SPEECH_CENTER_OFFSET_PERCENT,
    Math.min(MAX_SPEECH_CENTER_OFFSET_PERCENT, nextOffset)
  ));
  saveCurrentReadingSettings(
    SPEECH_CENTER_OFFSET_KEY,
    speechCenterOffsetPercent
  );
  settingsSpeechPosition.value = String(speechCenterOffsetPercent);
  settingsSpeechPositionValue.textContent = (
    `${speechCenterOffsetPercent > 0 ? "+" : ""}${speechCenterOffsetPercent}%`
  );
  settingsSpeechPositionDown.disabled = (
    speechCenterOffsetPercent <= MIN_SPEECH_CENTER_OFFSET_PERCENT
  );
  settingsSpeechPositionUp.disabled = (
    speechCenterOffsetPercent >= MAX_SPEECH_CENTER_OFFSET_PERCENT
  );
  if (followCurrent && speechActiveJob) positionSpeechMarker(true);
}

applySpeechCenterOffset(speechCenterOffsetPercent);

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
  maximumLength = speechMaximumLength,
  appendTerminalPunctuation = true
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
    if (
      appendTerminalPunctuation &&
      !/[.!?,;:]["'’”)]*$/.test(text) &&
      text.length < maximum
    ) text += ".";
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

const buildViewportSpeechJobs = (
  entries,
  minimumLength = speechMinimumLength,
  maximumLength = speechMaximumLength
) => {
  const jobs = buildSpeechJobs(entries, minimumLength, maximumLength, false);
  if (jobs.length > 1 && jobs.at(-1).text.length < minimumLength) {
    jobs.pop();
  }
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

const pageIsVisible = () => (
  document.hidden !== true && document.visibilityState !== "hidden"
);

const cancelSpeechScroll = () => {
  if (speechScrollFrame !== null) window.cancelAnimationFrame(speechScrollFrame);
  speechScrollFrame = null;
  speechScrollTargetY = null;
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
  speechScrollTargetY = targetY;

  if (!pageIsVisible()) {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    speechScrollTargetY = null;
    return;
  }

  let startTime = null;
  const step = (time) => {
    if (!pageIsVisible()) {
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      speechScrollFrame = null;
      speechScrollTargetY = null;
      return;
    }
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
      speechScrollTargetY = null;
    }
  };

  speechScrollFrame = window.requestAnimationFrame(step);
};

const speechViewportBounds = (rangeHeight = 0) => {
  const fittingMargin = Math.max(0, (window.innerHeight - rangeHeight) / 2);
  const margin = Math.min(
    SPEECH_VIEWPORT_MARGIN_PX,
    window.innerHeight / 4,
    fittingMargin
  );
  return {
    top: margin,
    bottom: Math.max(margin, window.innerHeight - margin)
  };
};

const speechRectsBounds = (rects) => {
  if (!rects?.length) return null;
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return { top, bottom, height: Math.max(0, bottom - top) };
};

const speechTargetCenterY = (rangeHeight = 0) => {
  const viewport = speechViewportBounds(rangeHeight);
  const availableHeight = viewport.bottom - viewport.top;
  const desiredCenter = (
    window.innerHeight / 2 +
    window.innerHeight * (speechCenterOffsetPercent / 100)
  );
  if (rangeHeight >= availableHeight) {
    return viewport.top + availableHeight / 2;
  }
  return Math.max(
    viewport.top + rangeHeight / 2,
    Math.min(viewport.bottom - rangeHeight / 2, desiredCenter)
  );
};

const speechScrollOffsetForRects = (rects) => {
  const range = speechRectsBounds(rects);
  if (!range) return 0;
  const viewport = speechViewportBounds(range.height);
  const availableHeight = viewport.bottom - viewport.top;
  if (range.height >= availableHeight) return range.top - viewport.top;
  const currentCenter = range.top + range.height / 2;
  return currentCenter - speechTargetCenterY(range.height);
};

const speechPlanningTopY = () => {
  const viewport = speechViewportBounds();
  const assumedRangeHeight = (viewport.bottom - viewport.top) / 2;
  return speechTargetCenterY(assumedRangeHeight) - assumedRangeHeight / 2;
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

    const scrollOffset = speechScrollOffsetForRects(rects);
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
    const fallbackOffset = speechScrollOffsetForRects([rect]);
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
  positionSpeechMarker(job?.followText !== false);
};

function syncSpeechSpeakerOptions() {
  settingsSpeechSpeaker.replaceChildren();
  const randomOption = document.createElement("option");
  randomOption.value = "";
  randomOption.textContent = "RANDOM ID";
  settingsSpeechSpeaker.appendChild(randomOption);

  const details = speechVoiceDetails.get(speechVoicePreference);
  const speakerCount = Math.max(1, Number(details?.speakerCount) || 1);
  const shouldShow = Boolean(speechVoicePreference && details && speakerCount > 1);
  settingsSpeechSpeakerRow.hidden = !shouldShow;
  settingsSpeechSpeaker.disabled = !shouldShow;
  if (!shouldShow) {
    if (!speechVoicePreference || details) speechSpeakerPreference = "";
    settingsSpeechSpeaker.value = "";
    return;
  }

  const selectedId = Number(speechSpeakerPreference);
  if (
    speechSpeakerPreference !== "" &&
    (!Number.isInteger(selectedId) || selectedId < 0 || selectedId >= speakerCount)
  ) speechSpeakerPreference = "";

  for (let speakerId = 0; speakerId < speakerCount; speakerId += 1) {
    const option = document.createElement("option");
    const id = String(speakerId);
    const name = typeof details.speakerNames?.[id] === "string"
      ? details.speakerNames[id].trim()
      : "";
    option.value = id;
    option.textContent = name ? `ID ${id} — ${name}` : `ID ${id}`;
    settingsSpeechSpeaker.appendChild(option);
  }
  settingsSpeechSpeaker.value = speechSpeakerPreference;
}

const updateSpeechVoices = (voices, voiceDetails = []) => {
  const selected = speechVoicePreference;
  const detailLookup = new Map(
    (Array.isArray(voiceDetails) ? voiceDetails : [])
      .filter((details) => typeof details?.id === "string")
      .map((details) => [details.id, details])
  );
  speechVoiceDetails = new Map(voices.map((voice) => {
    const details = detailLookup.get(voice);
    return [voice, {
      speakerCount: Math.max(1, Number(details?.speakerCount) || 1),
      speakerNames: details?.speakerNames && typeof details.speakerNames === "object"
        ? details.speakerNames
        : {}
    }];
  }));
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
  const legacyMatches = selected
    ? voices.filter((voice) => voice.split("/").pop() === selected)
    : [];
  speechVoicePreference = voices.includes(selected)
    ? selected
    : legacyMatches.length === 1
      ? legacyMatches[0]
      : "";
  if (selected && !speechVoicePreference) speechSpeakerPreference = "";
  settingsSpeechVoice.value = speechVoicePreference;
  const previousSpeaker = speechSpeakerPreference;
  syncSpeechSpeakerOptions();
  if (
    (selected && selected !== speechVoicePreference) ||
    previousSpeaker !== speechSpeakerPreference
  ) saveCurrentReadingSettings();
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
  updateSpeechVoices(bridge.voices || [], bridge.voiceDetails || []);
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

const mappedSpeechRangeRects = (mapped, startOffset, endOffset) => {
  if (!mapped?.map.length || !document.createRange || endOffset <= startOffset) return [];
  const startBoundary = domBoundaryForOffset(mapped, startOffset, false);
  const endBoundary = domBoundaryForOffset(mapped, endOffset, true);
  if (!startBoundary || !endBoundary) return [];

  try {
    const range = document.createRange();
    range.setStart(startBoundary.node, startBoundary.offset);
    range.setEnd(endBoundary.node, endBoundary.offset);
    return [...(range.getClientRects?.() || [])]
      .filter((rect) => rect.height > 0 && rect.width > 0);
  } catch {
    return [];
  }
};

const visibleSpeechEntry = (element, viewportTop, viewportBottom) => {
  const blockRect = element.getBoundingClientRect?.();
  if (
    !blockRect ||
    blockRect.bottom <= viewportTop ||
    blockRect.top >= viewportBottom
  ) return null;

  const mapped = createSpeechTextMap(element);
  if (!mapped?.text) return null;
  if (blockRect.top >= viewportTop && blockRect.bottom <= viewportBottom) {
    return { element, text: mapped.text, mapBaseOffset: 0 };
  }

  const words = [...mapped.text.matchAll(/\S+/g)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length
  }));
  if (words.length === 0) return null;

  const rectCache = new Map();
  const wordRect = (index) => {
    if (rectCache.has(index)) return rectCache.get(index);
    const rects = mappedSpeechRangeRects(mapped, words[index].start, words[index].end);
    const rect = rects.length > 0
      ? {
        top: Math.min(...rects.map((item) => item.top)),
        bottom: Math.max(...rects.map((item) => item.bottom)),
        left: Math.min(...rects.map((item) => item.left)),
        right: Math.max(...rects.map((item) => item.right))
      }
      : null;
    rectCache.set(index, rect);
    return rect;
  };

  let low = 0;
  let high = words.length - 1;
  let firstCandidate = words.length;
  let lastCandidate = words.length - 1;
  let binarySearchFailed = false;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const rect = wordRect(middle);
    if (!rect) {
      binarySearchFailed = true;
      break;
    }
    if (rect.top >= viewportTop) {
      firstCandidate = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  if (!binarySearchFailed) {
    low = firstCandidate;
    high = words.length - 1;
    lastCandidate = -1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const rect = wordRect(middle);
      if (!rect) {
        binarySearchFailed = true;
        break;
      }
      if (rect.bottom <= viewportBottom) {
        lastCandidate = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
  }

  if (binarySearchFailed) {
    firstCandidate = 0;
    lastCandidate = words.length - 1;
  }
  const isVisible = (index) => {
    const rect = wordRect(index);
    return Boolean(
      rect &&
      rect.top >= viewportTop &&
      rect.bottom <= viewportBottom &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    );
  };
  while (firstCandidate <= lastCandidate && !isVisible(firstCandidate)) {
    firstCandidate += 1;
  }
  while (lastCandidate >= firstCandidate && !isVisible(lastCandidate)) {
    lastCandidate -= 1;
  }
  if (firstCandidate > lastCandidate) return null;

  const start = words[firstCandidate].start;
  const end = words[lastCandidate].end;
  return {
    element,
    text: mapped.text.slice(start, end),
    mapBaseOffset: start
  };
};

const speechEntriesInViewport = (viewportTop, viewportBottom, afterCursor = null) => {
  const blocks = [...viewer.querySelectorAll(SPEECH_BLOCK_SELECTOR)];
  const cursorIndex = afterCursor?.element
    ? blocks.indexOf(afterCursor.element)
    : -1;
  return blocks
    .map((element, index) => {
      if (cursorIndex >= 0 && index < cursorIndex) return null;
      const entry = visibleSpeechEntry(element, viewportTop, viewportBottom);
      if (!entry || index !== cursorIndex) return entry;

      const mapped = createSpeechTextMap(element);
      const entryEnd = entry.mapBaseOffset + entry.text.length;
      let start = Math.max(entry.mapBaseOffset, afterCursor.offset);
      while (start < entryEnd && /\s/.test(mapped.text[start])) start += 1;
      if (start >= entryEnd) return null;
      return {
        element,
        text: mapped.text.slice(start, entryEnd),
        mapBaseOffset: start
      };
    })
    .filter(Boolean);
};

const speechEntriesFromViewport = (afterCursor = null) => speechEntriesInViewport(
  8,
  Math.max(8, window.innerHeight - 8),
  afterCursor
);

const clipSpeechEntriesAtSourceOffset = (entries, sourceEnd) => {
  const source = speechSourceFromEntries(entries);
  return source.segments.flatMap((segment) => {
    if (segment.start >= sourceEnd) return [];
    const segmentEnd = Math.min(segment.end, sourceEnd);
    const text = source.text.slice(segment.start, segmentEnd).trimEnd();
    if (!text) return [];
    return [{
      element: segment.element,
      text,
      selectedRange: segment.selectedRange,
      mapBaseOffset: segment.mapBaseOffset
    }];
  });
};

const sentenceBoundedViewportEntries = (entries) => {
  const source = speechSourceFromEntries(entries);
  if (!source.text || /[.!?]+["'’”)]*$/.test(source.text)) return entries;

  let sentenceEnd = -1;
  for (const match of source.text.matchAll(/[.!?]+["'’”)]*(?=\s|$)/g)) {
    sentenceEnd = match.index + match[0].length;
  }
  if (sentenceEnd <= 0) return entries;
  return clipSpeechEntriesAtSourceOffset(entries, sentenceEnd);
};

const speechCursorFromJob = (job) => {
  const segment = [...(job?.segments || [])].reverse().find((candidate) => (
    candidate.element && candidate.end > job.sourceStart && candidate.start < job.sourceEnd
  ));
  if (!segment) return null;
  return {
    element: segment.element,
    offset: segment.mapBaseOffset + Math.min(segment.end, job.sourceEnd) - segment.start
  };
};

const waitForSpeechScroll = () => new Promise((resolve) => {
  if (!pageIsVisible()) {
    resolve();
    return;
  }
  window.setTimeout(resolve, SPEECH_SCROLL_DURATION_MS + 40);
});

const scrollBySpeechOffset = async (offset) => {
  if (!Number.isFinite(offset) || Math.abs(offset) <= 1) return false;
  animateSpeechScrollBy(offset);
  await waitForSpeechScroll();
  return true;
};

const ensureSpeechJobVisible = async (job) => {
  if (!pageIsVisible()) return true;
  const renderedRects = () => [...(createSpeechRange(job)?.getClientRects?.() || [])]
    .filter((rect) => rect.height > 0 && rect.width > 0);
  let rects = renderedRects();
  if (rects.length === 0) return false;

  await scrollBySpeechOffset(speechScrollOffsetForRects(rects));
  if (!pageIsVisible()) return true;
  positionSpeechMarker(false);
  rects = renderedRects();
  const range = speechRectsBounds(rects);
  if (!range) return false;
  const viewport = speechViewportBounds(range.height);
  if (range.height > window.innerHeight) {
    return range.top < viewport.bottom && range.bottom > viewport.top;
  }
  const fitsPreferredBounds = (
    range.top >= viewport.top - 1 && range.bottom <= viewport.bottom + 1
  );
  const fitsPhysicalViewport = (
    range.top >= -1 && range.bottom <= window.innerHeight + 1
  );
  return fitsPreferredBounds || fitsPhysicalViewport;
};

const scrollDownAfterSpeechJob = async (job) => {
  const rects = [...(createSpeechRange(job)?.getClientRects?.() || [])]
    .filter((rect) => rect.height > 0 && rect.width > 0);
  const lastRect = rects.at(-1);
  if (!lastRect) return false;
  const targetY = speechPlanningTopY();
  const offset = Math.max(0, lastRect.bottom - targetY);
  return scrollBySpeechOffset(offset);
};

const nextSpeechViewport = (cursor) => {
  if (!cursor?.element) return null;
  const blocks = [...viewer.querySelectorAll(SPEECH_BLOCK_SELECTOR)];
  const cursorIndex = blocks.indexOf(cursor.element);
  if (cursorIndex < 0) return false;

  for (let index = cursorIndex; index < blocks.length; index += 1) {
    const element = blocks[index];
    const mapped = createSpeechTextMap(element);
    if (!mapped?.text) continue;
    let start = index === cursorIndex ? cursor.offset : 0;
    while (start < mapped.text.length && /\s/.test(mapped.text[start])) start += 1;
    if (start >= mapped.text.length) continue;
    let end = start + 1;
    while (end < mapped.text.length && !/\s/.test(mapped.text[end])) end += 1;
    const firstRect = mappedSpeechRangeRects(mapped, start, end)[0];
    if (!firstRect) continue;

    const targetY = speechPlanningTopY();
    const offset = Math.max(0, firstRect.top - targetY);
    const entries = sentenceBoundedViewportEntries(speechEntriesInViewport(
      8 + offset,
      Math.max(8 + offset, window.innerHeight - 8 + offset),
      cursor
    ));
    if (entries.length > 0) return { entries, offset };
  }
  return null;
};

const clearSpeechIndicators = () => {
  speechVoice.hidden = true;
  speechVoice.textContent = "";
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
    let entries = selectedText
      ? [{
        element: selectedMapOffset >= 0 ? selectedElement : null,
        text: selectedText,
        selectedRange,
        mapBaseOffset: Math.max(0, selectedMapOffset)
      }]
      : sentenceBoundedViewportEntries(speechEntriesFromViewport());
    if (entries.length === 0) {
      throw new Error(selectedText
        ? "No readable text was found in the selection."
        : "No readable text is visible. Scroll to some text and try again.");
    }
    const requestedVoice = speechVoicePreference || null;
    const requestedSpeaker = speechSpeakerPreference === ""
      ? null
      : Number(speechSpeakerPreference);
    const prepareJob = (job) => requestPiper("/api/piper/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: job.text,
        voice: requestedVoice,
        speaker: requestedSpeaker,
        sessionId: speechSessionId,
        audioFormat: speechAudioFormat
      })
    });
    const settlePreparation = (job) => prepareJob(job)
      .then((value) => ({ value }), (error) => ({ error }));

    const viewportReading = !selectedText;
    let viewportCursor = null;
    let firstBatch = true;
    let queuedBatch = null;
    while (entries.length > 0) {
      const jobs = queuedBatch?.jobs || (viewportReading
        ? buildViewportSpeechJobs(entries)
        : buildSpeechJobs(entries));
      if (jobs.length === 0) break;
      if (viewportReading) jobs.forEach((job) => { job.followText = false; });
      settingsSpeechStatus.textContent = queuedBatch
        ? "Next visible text is ready."
        : firstBatch
          ? "Generating first chunk…"
          : "Generating newly visible text…";
      firstBatch = false;
      let prepared;
      if (queuedBatch) {
        const settled = await queuedBatch.firstPreparation;
        if (settled.error) throw settled.error;
        prepared = settled.value;
        queuedBatch = null;
      } else {
        prepared = await prepareJob(jobs[0]);
      }
      let futureBatch = null;

      for (let index = 0; index < jobs.length; index += 1) {
        if (generation !== speechGeneration) return;
        const currentJob = jobs[index];
        let nextPreparation = index + 1 < jobs.length
          ? settlePreparation(jobs[index + 1])
          : null;
        if (viewportReading && !nextPreparation) {
          const futureCursor = speechCursorFromJob(currentJob) || viewportCursor;
          const plan = nextSpeechViewport(futureCursor);
          if (plan) {
            const futureJobs = buildViewportSpeechJobs(plan.entries);
            futureJobs.forEach((job) => { job.followText = false; });
            if (futureJobs.length > 0) {
              futureBatch = {
                entries: plan.entries,
                jobs: futureJobs,
                offset: plan.offset,
                cursor: futureCursor,
                firstPreparation: settlePreparation(futureJobs[0])
              };
            }
          }
        }
        const voiceName = prepared.voice?.replace(/\.onnx$/i, "") || "Piper";
        speechVoice.textContent = formatSpeechVoice(prepared);
        speechVoice.hidden = false;
        setSpeechActiveJob(currentJob);
        const backgroundGeneration = nextPreparation || futureBatch?.firstPreparation;
        settingsSpeechStatus.textContent = backgroundGeneration
          ? `Playing with ${voiceName}; generating next…`
          : `Playing with ${voiceName}…`;
        syncSpeechControls();

        const visible = await ensureSpeechJobVisible(currentJob);
        if (!visible) throw new Error("The next spoken text could not be brought into view.");
        await playPreparedAudio(prepared);
        speechIsPaused = false;
        syncSpeechControls();
        if (generation !== speechGeneration) return;

        if (viewportReading) {
          viewportCursor = speechCursorFromJob(currentJob) || viewportCursor;
          if (futureBatch && index === jobs.length - 1) {
            await scrollBySpeechOffset(futureBatch.offset);
          } else {
            await scrollDownAfterSpeechJob(currentJob);
          }
          if (generation !== speechGeneration) return;
        }

        if (nextPreparation) {
          const settled = await nextPreparation;
          if (settled.error) throw settled.error;
          prepared = settled.value;
        }
      }

      if (!viewportReading || !viewportCursor) break;
      if (!futureBatch) break;
      entries = futureBatch.entries;
      queuedBatch = futureBatch;
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
    captureStableResizeAnchor();
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
        thumbnail: thumbnail || previousCachedBook?.thumbnail || "",
        thumbnailVersion: COVER_THUMBNAIL_VERSION
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

    activeBookTitle = metadata?.title
      ? `${metadata.title} — Smooth Reader`
      : "Smooth Reader";
    document.title = activeBookTitle;
    readerScrollBeforeHome = window.scrollY;
    commitReaderHistory();
  } catch (error) {
    console.error(error);
    destroyCurrentBook();
    activeBookKey = null;
    activeBookTitle = "";
    replaceHomeHistory();
    showHomeView();
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
  if (currentAppHistoryView() === "reader" && window.history?.back) {
    window.history.back();
    return;
  }
  replaceHomeHistory();
  showHomeView();
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

  if (reader.hidden && noCommandModifier && !event.shiftKey && key === "r") {
    event.preventDefault();
    if (!isBookLoading) reopenLastBook();
    return;
  }

  if (reader.hidden) return;

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
startExportLibrary.addEventListener("click", () => void exportLibrary());
startImportLibrary.addEventListener("click", () => libraryImportInput.click());
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
  speechSpeakerPreference = "";
  syncSpeechSpeakerOptions();
  saveCurrentReadingSettings();
});
settingsSpeechSpeaker.addEventListener("change", (event) => {
  speechSpeakerPreference = /^\d+$/.test(event.target.value)
    ? event.target.value
    : "";
  saveCurrentReadingSettings();
});

settingsSpeechMax.addEventListener("input", (event) => {
  applySpeechBounds(speechMinimumLength, Number(event.target.value), "maximum");
});
settingsSpeechMax.addEventListener("change", (event) => {
  applySpeechBounds(speechMinimumLength, Number(event.target.value), "maximum", true);
});
settingsSpeechPosition.addEventListener("input", (event) => {
  applySpeechCenterOffset(Number(event.target.value), true);
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
  applySpeechCenterOffset(speechCenterOffsetPercent - 1, true);
});
settingsSpeechPositionUp.addEventListener("click", () => {
  applySpeechCenterOffset(speechCenterOffsetPercent + 1, true);
});

settingsPaletteSelect.addEventListener("change", (event) => {
  applyPalette(PALETTES.findIndex((palette) => palette.id === event.target.value));
});
const handleContrastInput = (event, announce = false) => {
  applyContrast(Number(event.target.value), announce);
};
settingsContrast.addEventListener("input", (event) => handleContrastInput(event));
settingsContrast.addEventListener("change", (event) => handleContrastInput(event, true));
settingsContrastDown.addEventListener("click", () => applyContrast(contrast - 1));
settingsContrastUp.addEventListener("click", () => applyContrast(contrast + 1));
settingsFontSelect.addEventListener("change", (event) => {
  applyFont(FONTS.findIndex((font) => font.id === event.target.value));
});

const handleFontSizeInput = (event, announce = false) => {
  applyFontSize(Number(event.target.value), announce);
};
settingsFontSize.addEventListener("input", (event) => handleFontSizeInput(event));
settingsFontSize.addEventListener("change", (event) => handleFontSizeInput(event, true));
settingsFontSizeDown.addEventListener("click", () => {
  applyFontSize(fontSizePx - FONT_SIZE_STEP_PX);
});
settingsFontSizeUp.addEventListener("click", () => {
  applyFontSize(fontSizePx + FONT_SIZE_STEP_PX);
});

const handleLineHeightInput = (event, announce = false) => {
  applyLineHeight(Number(event.target.value), announce);
};
settingsLineHeight.addEventListener("input", (event) => handleLineHeightInput(event));
settingsLineHeight.addEventListener("change", (event) => handleLineHeightInput(event, true));
settingsLineHeightDown.addEventListener("click", () => {
  applyLineHeight(lineHeight - LINE_HEIGHT_STEP);
});
settingsLineHeightUp.addEventListener("click", () => {
  applyLineHeight(lineHeight + LINE_HEIGHT_STEP);
});

settingsTrackingDown.addEventListener("click", () => {
  applyTracking(trackingEm - TRACKING_STEP_EM);
});
settingsTrackingReset.addEventListener("click", () => applyTracking(DEFAULT_TRACKING_EM));
settingsTrackingUp.addEventListener("click", () => {
  applyTracking(trackingEm + TRACKING_STEP_EM);
});

const handleWidthInput = (event, announce = false) => {
  applyWidth(Number(event.target.value), announce);
};
settingsWidth.addEventListener("input", (event) => handleWidthInput(event));
settingsWidth.addEventListener("change", (event) => handleWidthInput(event, true));
settingsWidthDown.addEventListener("click", () => applyWidth(widthCh - 2));
settingsWidthUp.addEventListener("click", () => applyWidth(widthCh + 2));

settingsToggle.addEventListener("click", () => {
  setSettingsOpen(settingsPanel.hidden);
});
settingsHome.addEventListener("click", returnToHomeScreen);
settingsResetBook.addEventListener("click", resetCurrentBookSettings);

window.addEventListener("click", (event) => {
  if (!settingsPanel.hidden && !event.target?.closest?.("#settings-menu")) {
    setSettingsOpen(false);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files?.length) openDroppedFiles(fileInput.files);
  fileInput.value = "";
});

libraryImportInput.addEventListener("change", () => {
  const file = libraryImportInput.files?.[0];
  if (file) void importLibrary(file);
  libraryImportInput.value = "";
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
  scheduleStableResizeAnchorCapture();
}, { passive: true });
window.addEventListener("resize", handleViewportResize, { passive: true });
window.addEventListener("popstate", (event) => {
  if (event.state?.app !== HISTORY_APP) return;
  if (event.state.view === "reader") showReaderView();
  else showHomeView();
});
document.addEventListener?.("visibilitychange", () => {
  if (!pageIsVisible()) {
    if (speechScrollTargetY !== null) {
      const targetY = speechScrollTargetY;
      cancelSpeechScroll();
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      updateReadingProgress();
    }
    return;
  }
  scheduleSpeechMarkerRefresh();
});
if (typeof window.ResizeObserver === "function") {
  const speechLayoutObserver = new window.ResizeObserver(scheduleSpeechMarkerRefresh);
  speechLayoutObserver.observe(viewer);
}
window.addEventListener("blur", () => stopRightDrag());
window.addEventListener("beforeunload", savePositionNow);
syncSpeechControls();
void probePiperBridge();
