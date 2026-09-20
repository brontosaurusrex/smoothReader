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
const startManageLibrary = document.querySelector("#start-manage-library");
const libraryManageActions = document.querySelector("#library-manage-actions");
const startStoreServer = document.querySelector("#start-store-server");
const startRemoveLocal = document.querySelector("#start-remove-local");
const startRemoveServer = document.querySelector("#start-remove-server");
const startCancelManage = document.querySelector("#start-cancel-manage");
const libraryImportInput = document.querySelector("#library-import-input");
const settingsMenu = document.querySelector("#settings-menu");
const settingsToggle = document.querySelector("#settings-toggle");
const fullscreenToggle = document.querySelector("#fullscreen-toggle");
const settingsPanel = document.querySelector("#settings-panel");
const settingsPaletteSelect = document.querySelector("#settings-palette");
const settingsPalettePicker = document.querySelector("#settings-palette-picker");
const settingsPaletteToggle = document.querySelector("#settings-palette-toggle");
const settingsPaletteName = document.querySelector("#settings-palette-name");
const settingsPaletteSwatches = document.querySelector("#settings-palette-swatches");
const settingsPaletteOptions = document.querySelector("#settings-palette-options");
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
const settingsSpeechSpeed = document.querySelector("#settings-speech-speed");
const settingsSpeechSpeedValue = document.querySelector("#settings-speech-speed-value");
const settingsSpeechSpeedDown = document.querySelector("#settings-speech-speed-down");
const settingsSpeechSpeedUp = document.querySelector("#settings-speech-speed-up");
const settingsSpeechStart = document.querySelector("#settings-speech-start");
const settingsSpeechPause = document.querySelector("#settings-speech-pause");
const settingsSpeechStop = document.querySelector("#settings-speech-stop");
const settingsSpeechStatus = document.querySelector("#settings-speech-status");
const speechMarker = document.querySelector("#speech-marker");
const speechAudio = document.querySelector("#speech-audio");
const settingsHome = document.querySelector("#settings-home");
const settingsOpen = document.querySelector("#settings-open");
const settingsResetBook = document.querySelector("#settings-reset-book");
const readingLocation = document.querySelector("#reading-location");
const readingProgress = document.querySelector("#reading-progress");
const readingPages = document.querySelector("#reading-pages");
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
const SPEECH_SPEED_KEY = "smooth-reader:speech-speed";
const SPEECH_SESSION_KEY = "smooth-reader:speech-session";
const SILENT_WAV_DATA_URL = "data:audio/wav;base64,UklGRmQBAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
const LAST_BOOK_KEY = "smooth-reader:last-book";
const RECENT_BOOKS_KEY = "smooth-reader:recent-books";
const LAST_BOOK_DB = "smooth-reader-library";
const LAST_BOOK_STORE = "books";
const LAST_BOOK_RECORD = "last-opened";
const RECENT_BOOKS_RECORD = "recent-books";
const MAX_RECENT_BOOKS = 12;
const SIMULATED_PAGE_CHARACTERS = 2_000;
const COVER_THUMBNAIL_VERSION = 3;
const COVER_THUMBNAIL_MAX_WIDTH = 600;
const COVER_THUMBNAIL_MAX_HEIGHT = 900;
const COVER_THUMBNAIL_QUALITY = 0.86;
const LIBRARY_BACKUP_FORMAT = "smooth-reader-library";
const LIBRARY_BACKUP_VERSION = 1;
const MAX_LIBRARY_IMPORT_BYTES = 512 * 1024 * 1024;
const EPUB_OPEN_TIMEOUT_MS = 30_000;
const SERVER_LIBRARY_REQUEST_TIMEOUT_MS = 30_000;
const SERVER_LIBRARY_UPLOAD_TIMEOUT_MS = 180_000;
const SERVER_STATE_SYNC_DELAY_MS = 1_500;
const HISTORY_APP = "smooth-reader";
const SAVE_DELAY_MS = 180;
const IMAGE_LAYOUT_WAIT_MS = 4000;
const PAGE_SCROLL_RATIO = 0.88;
const RIGHT_DRAG_SPEED = 1.35;
const FIRST_VISIBLE_LINE_TOP_PADDING_PX = 12;
const FIRST_VISIBLE_LINE_SCAN_STEP_PX = 4;
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
const FONT_PALETTE_STATUS_DURATION_MS = 3_900;
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
const DEFAULT_SPEECH_SPEED_PERCENT = 0;
const MIN_SPEECH_SPEED_PERCENT = -33;
const MAX_SPEECH_SPEED_PERCENT = 33;
const SPEECH_VIEWPORT_MARGIN_PX = 16;
const SPEECH_SCROLL_DURATION_MS = 10;
const SPEECH_BLOCK_SELECTOR = "p, li, blockquote, h1, h2, h3, h4, h5, h6";
const PALETTES = [
  { id: "charcoal", name: "CHARCOAL", swatches: ["#121212", "#dedad1", "#77746e", "#373532", "#eeeae1"] },
  { id: "geany", name: "GEANY", swatches: ["#333d4d", "#b7c7c2", "#648d85", "#536665", "#d2ddd8"] },
  { id: "midnight", name: "MIDNIGHT", swatches: ["#0d1520", "#cfdae5", "#71869b", "#29394a", "#e5edf5"] },
  { id: "sepia", name: "SEPIA", swatches: ["#241d16", "#dfcfb7", "#9b8465", "#4b3d2d", "#f1e0c5"] },
  { id: "forest", name: "FOREST", swatches: ["#101914", "#d2dfd4", "#718c76", "#2c4333", "#e4eee5"] },
  { id: "paper", name: "PAPER", swatches: ["#e8e1d3", "#302d28", "#746c60", "#c3b9a8", "#1f1d1a"] },
  { id: "nord", name: "NORD", swatches: ["#2e3440", "#d8dee9", "#8192aa", "#4c566a", "#eceff4"] },
  { id: "solarized", name: "SOLARIZED DARK", swatches: ["#002b36", "#93a1a1", "#657b83", "#164550", "#eee8d5"] },
  { id: "gruvbox", name: "GRUVBOX", swatches: ["#282828", "#ebdbb2", "#a89984", "#504945", "#fbf1c7"] },
  { id: "plum", name: "PLUM", swatches: ["#211924", "#dacdda", "#907c91", "#4b3b50", "#f0e5ef"] },
  { id: "flexoki-dark", name: "FLEXOKI DARK", swatches: ["#100f0f", "#cecdc3", "#878580", "#343331", "#e6e4d9"] },
  { id: "catppuccin-mocha", name: "CATPPUCCIN MOCHA", swatches: ["#1e1e2e", "#cdd6f4", "#9399b2", "#45475a", "#f5e0dc"] },
  { id: "hackerman", name: "HACKERMAN", swatches: ["#080d0d", "#a8d5ca", "#527d78", "#224a46", "#c7f0e6"] },
  { id: "lumon", name: "LUMON", swatches: ["#0e1a26", "#d6e0e2", "#79a6b9", "#294758", "#f3ffff"] },
  { id: "vantablack", name: "VANTABLACK", swatches: ["#000000", "#d8d8d2", "#777772", "#292927", "#f0f0eb"] },
  { id: "black-gold", name: "BLACK GOLD", swatches: ["#0d0d0d", "#ebdbb2", "#8f8265", "#4a4434", "#f6f1dd"] }
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
let lastVisiblePositionSnapshot = null;
let lastVisibleScrollSnapshot = null;
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
let libraryManageMode = false;
const selectedLibraryBooks = new Set();
let serverLibraryAvailable = false;
let serverLibraryBusy = false;
let serverBookInfo = [];
const serverBookHashes = new Set();
let activeBookCharacterCount = 0;
const serverStateSyncTimers = new Map();
const serverStateSyncing = new Map();
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
const speechPrefetchControllers = new Set();
const speechPrefetchedUrls = new Set();
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
const savedSpeechSpeed = Number.parseInt(localStorage.getItem(SPEECH_SPEED_KEY), 10);
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
let speechSpeedPercent = Number.isFinite(savedSpeechSpeed)
  ? Math.max(MIN_SPEECH_SPEED_PERCENT, Math.min(MAX_SPEECH_SPEED_PERCENT, savedSpeechSpeed))
  : DEFAULT_SPEECH_SPEED_PERCENT;

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

const withTimeout = (promise, milliseconds, message) => {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
};

const serverRequest = async (path, options = {}, timeout = SERVER_LIBRARY_REQUEST_TIMEOUT_MS) => {
  if (typeof window.fetch !== "function") throw new Error("Server library is unavailable");
  const { expectBinary = false, ...fetchOptions } = options;
  const response = await withTimeout(
    window.fetch(path, { credentials: "same-origin", ...fetchOptions }),
    timeout,
    "Server library request timed out"
  );
  let payload = null;
  if (expectBinary) {
    if (!response.ok) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      throw new Error(payload?.error || `Server library returned HTTP ${response.status}`);
    }
    return response.arrayBuffer();
  }
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `Server library returned HTTP ${response.status}`);
  }
  return payload;
};

const serverRecordFor = (record) => serverBookInfo.find((candidate) =>
  booksMatch(record, candidate)
);

const cachedRecordFor = (record) => cachedRecentBooks.find((candidate) =>
  booksMatch(record, candidate)
);

const positionKey = (hash) => `${POSITION_PREFIX}${hash}`;

const loadPosition = (hash) => {
  try {
    const stored = localStorage.getItem(positionKey(hash));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const normalizedCharacterCount = (text) => String(text || "")
  .replace(/\s+/g, " ")
  .trim()
  .length;

const normalizedMetadataText = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizedMetadataText).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    for (const key of ["name", "value", "text", "#text", "_"]) {
      const text = normalizedMetadataText(value[key]);
      if (text) return text;
    }
    return "";
  }
  return String(value || "").replace(/\s+/g, " ").trim();
};

const publicationYearFrom = (value) => {
  const match = normalizedMetadataText(value).match(/\b([12]\d{3})\b/);
  return match?.[1] || "";
};

const decodeXmlText = (value) => String(value || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&#x([0-9a-f]+);/gi, (_, digits) =>
    String.fromCodePoint(Number.parseInt(digits, 16)))
  .replace(/&#([0-9]+);/g, (_, digits) =>
    String.fromCodePoint(Number.parseInt(digits, 10)))
  .replace(/&quot;/gi, '"')
  .replace(/&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&amp;/gi, "&")
  .replace(/\s+/g, " ")
  .trim();

const xmlTagAttributes = (tagSource) => {
  const attributes = {};
  for (const match of String(tagSource || "").matchAll(
    /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  )) {
    attributes[match[1].toLowerCase()] = decodeXmlText(match[2] ?? match[3]);
  }
  return attributes;
};

const opfManifestItems = (packageXml) => {
  const manifestSource = String(packageXml || "").match(
    /<(?:[\w.-]+:)?manifest\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?manifest\s*>/i
  )?.[1] || "";
  return Array.from(manifestSource.matchAll(/<(?:[\w.-]+:)?item\b[^>]*\/?>/gi))
    .map((match) => xmlTagAttributes(match[0]))
    .filter((item) => item.href);
};

const archivePathFrom = (basePath, relativeHref) => {
  const href = decodeXmlText(relativeHref).replace(/\\/g, "/").split(/[?#]/, 1)[0];
  if (!href) return "";
  const parts = href.startsWith("/")
    ? []
    : String(basePath || "").replace(/\\/g, "/").split("/").slice(0, -1);
  for (const part of href.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
};

const archiveEntryForPath = (archive, path) => {
  if (!path) return null;
  const direct = archive.file(path);
  if (direct) return { entry: direct, path };
  try {
    const decodedPath = decodeURIComponent(path);
    const decoded = decodedPath !== path ? archive.file(decodedPath) : null;
    return decoded ? { entry: decoded, path: decodedPath } : null;
  } catch {
    return null;
  }
};

const imageMimeTypeFor = (path, declaredType = "") => {
  if (String(declaredType).toLowerCase().startsWith("image/")) return declaredType;
  const extension = String(path || "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return ({
    avif: "image/avif",
    gif: "image/gif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    webp: "image/webp"
  })[extension] || "";
};

const plausiblePublicationYearFrom = (value) => {
  const year = Number(publicationYearFrom(value));
  return year >= 1450 && year <= new Date().getFullYear() + 1 ? String(year) : "";
};

const publicationYearFromDocument = (markup) => {
  const text = decodeXmlText(markup);
  const patterns = [
    /(?:copyright\s*)?(?:©|&copy;|\(c\))\s*([12]\d{3})/i,
    /\bcopyright\D{0,24}([12]\d{3})\b/i,
    /\b(?:first\s+published|published|publication(?:\s+date)?|first\s+edition)\D{0,40}([12]\d{3})\b/i,
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+([12]\d{3})\s*:\s*(?:first|\d+(?:st|nd|rd|th))\s+(?:edition|printing)/i
  ];
  for (const pattern of patterns) {
    const year = plausiblePublicationYearFrom(text.match(pattern)?.[1]);
    if (year) return year;
  }
  return "";
};

const extractOpfBookMetadata = (packageXml) => {
  const source = String(packageXml || "");
  if (!source) return {};

  if (typeof DOMParser === "function") {
    try {
      const document = new DOMParser().parseFromString(source, "application/xml");
      if (!document.querySelector("parsererror")) {
        const metadata = Array.from(document.getElementsByTagName("*")).find(
          (element) => element.localName?.toLowerCase() === "metadata"
        );
        if (metadata) {
          const elements = Array.from(metadata.getElementsByTagName("*"));
          const dcText = (localName) => normalizedMetadataText(
            elements.find((element) =>
              element.localName?.toLowerCase() === localName &&
              (element.namespaceURI === "http://purl.org/dc/elements/1.1/" ||
                element.prefix?.toLowerCase() === "dc")
            )?.textContent
          );
          const propertyText = (...properties) => normalizedMetadataText(
            elements.find((element) =>
              element.localName?.toLowerCase() === "meta" &&
              properties.includes((element.getAttribute("property") || "").toLowerCase())
            )?.textContent
          );
          return {
            title: dcText("title"),
            author: dcText("creator"),
            publicationYear: plausiblePublicationYearFrom(dcText("date")) ||
              plausiblePublicationYearFrom(
                propertyText("dcterms:issued", "dcterms:date")
              )
          };
        }
      }
    } catch {
      // Fall through to the small XML-text fallback below.
    }
  }

  const metadataSource = source.match(/<(?:[\w.-]+:)?metadata\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?metadata\s*>/i)?.[1] || source;
  const elementText = (localName) => decodeXmlText(
    metadataSource.match(
      new RegExp(`<(?:dc:)?${localName}\\b[^>]*>([\\s\\S]*?)<\\/(?:dc:)?${localName}\\s*>`, "i")
    )?.[1]
  );
  const propertyText = (...properties) => {
    for (const property of properties) {
      const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const value = metadataSource.match(
        new RegExp(`<meta\\b(?=[^>]*\\bproperty\\s*=\\s*["']${escaped}["'])[^>]*>([\\s\\S]*?)<\\/meta\\s*>`, "i")
      )?.[1];
      if (value) return decodeXmlText(value);
    }
    return "";
  };
  return {
    title: elementText("title"),
    author: elementText("creator"),
    publicationYear: plausiblePublicationYearFrom(elementText("date")) ||
      plausiblePublicationYearFrom(
        propertyText("dcterms:issued", "dcterms:date")
      )
  };
};

const opfMetaAttributes = (packageXml) => Array.from(
  String(packageXml || "").matchAll(/<(?:[\w.-]+:)?meta\b[^>]*\/?>/gi)
).map((match) => xmlTagAttributes(match[0]));

const opfGuideReferences = (packageXml) => {
  const guideSource = String(packageXml || "").match(
    /<(?:[\w.-]+:)?guide\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?guide\s*>/i
  )?.[1] || "";
  return Array.from(guideSource.matchAll(/<(?:[\w.-]+:)?reference\b[^>]*\/?>/gi))
    .map((match) => xmlTagAttributes(match[0]))
    .filter((reference) => reference.href);
};

const uniqueResourceCandidates = (candidates) => {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.href || ""}\n${candidate.type || ""}`;
    if (!candidate.href || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const publicationYearFromArchive = async (archive, packagePath, packageXml) => {
  const manifestItems = opfManifestItems(packageXml);
  const guideReferences = opfGuideReferences(packageXml);
  const likelyNames = /(?:copyright|copyrt|colophon|publication|title[-_. ]?page)/i;
  const candidates = uniqueResourceCandidates([
    ...manifestItems
      .filter((item) =>
        /(?:xhtml|html)/i.test(item["media-type"] || "") &&
        likelyNames.test(`${item.id || ""} ${item.href || ""}`)
      )
      .map((item) => ({ href: item.href, type: item["media-type"] })),
    ...guideReferences
      .filter((reference) =>
        /(?:copyright|colophon|title-page)/i.test(reference.type || "") ||
        likelyNames.test(`${reference.title || ""} ${reference.href || ""}`)
      )
      .map((reference) => ({ href: reference.href, type: "application/xhtml+xml" }))
  ]);

  for (const candidate of candidates.slice(0, 8)) {
    const path = archivePathFrom(packagePath, candidate.href);
    const resource = archiveEntryForPath(archive, path);
    if (!resource) continue;
    try {
      const markup = await resource.entry.async("string");
      const year = publicationYearFromDocument(markup);
      if (year) return year;
    } catch {
      // Ignore an unreadable optional metadata page.
    }
  }
  return "";
};

const coverImageFromArchive = async (archive, packagePath, packageXml) => {
  const manifestItems = opfManifestItems(packageXml);
  const manifestById = new Map(
    manifestItems.filter((item) => item.id).map((item) => [item.id, item])
  );
  const coverMeta = opfMetaAttributes(packageXml).find(
    (meta) => (meta.name || "").toLowerCase() === "cover" && meta.content
  );
  const metaManifestItem = coverMeta ? manifestById.get(coverMeta.content) : null;
  const directCandidates = uniqueResourceCandidates([
    ...manifestItems
      .filter((item) => (item.properties || "").split(/\s+/).includes("cover-image"))
      .map((item) => ({ href: item.href, type: item["media-type"] })),
    ...(metaManifestItem
      ? [{ href: metaManifestItem.href, type: metaManifestItem["media-type"] }]
      : []),
    ...(coverMeta ? [{ href: coverMeta.content, type: "" }] : []),
    ...manifestItems
      .filter((item) =>
        (item["media-type"] || "").startsWith("image/") &&
        /cover/i.test(`${item.id || ""} ${item.href || ""}`)
      )
      .map((item) => ({ href: item.href, type: item["media-type"] }))
  ]);

  const readImageCandidate = async (basePath, candidate) => {
    const path = archivePathFrom(basePath, candidate.href);
    const type = imageMimeTypeFor(path, candidate.type);
    if (!type) return null;
    const resource = archiveEntryForPath(archive, path);
    if (!resource) return null;
    try {
      return {
        bytes: await resource.entry.async("uint8array"),
        type,
        path: resource.path
      };
    } catch {
      return null;
    }
  };

  for (const candidate of directCandidates) {
    const image = await readImageCandidate(packagePath, candidate);
    if (image) return image;
  }

  const pageCandidates = uniqueResourceCandidates([
    ...opfGuideReferences(packageXml)
      .filter((reference) => (reference.type || "").toLowerCase() === "cover")
      .map((reference) => ({ href: reference.href, type: "application/xhtml+xml" })),
    ...manifestItems
      .filter((item) =>
        /(?:xhtml|html)/i.test(item["media-type"] || "") &&
        /cover/i.test(`${item.id || ""} ${item.href || ""}`)
      )
      .map((item) => ({ href: item.href, type: item["media-type"] }))
  ]);

  for (const page of pageCandidates) {
    const pagePath = archivePathFrom(packagePath, page.href);
    const pageResource = archiveEntryForPath(archive, pagePath);
    if (!pageResource) continue;
    try {
      const markup = await pageResource.entry.async("string");
      const imageTags = Array.from(markup.matchAll(
        /<(?:[\w.-]+:)?(?:img|image|object)\b[^>]*\/?>/gi
      ));
      for (const match of imageTags) {
        const attributes = xmlTagAttributes(match[0]);
        const href = attributes.src || attributes.href || attributes["xlink:href"] ||
          attributes.data;
        const image = await readImageCandidate(pageResource.path, {
          href,
          type: attributes.type || ""
        });
        if (image) return image;
      }
    } catch {
      // Ignore an unreadable optional cover page.
    }
  }
  return null;
};

const extractEpubBookMetadata = (metadata, packageMetadata = {}) => ({
  title: normalizedMetadataText(metadata?.title || packageMetadata.title),
  author: normalizedMetadataText(
    metadata?.creator || metadata?.author || packageMetadata.author
  ),
  publicationYear: plausiblePublicationYearFrom(
    metadata?.pubdate || metadata?.date || metadata?.published
  ) || plausiblePublicationYearFrom(packageMetadata.publicationYear)
});

const formatBookMetadataTitle = (record) => {
  const title = normalizedMetadataText(record?.title);
  const author = normalizedMetadataText(record?.author);
  const publicationYear = publicationYearFrom(record?.publicationYear);
  if (title && author && publicationYear) {
    return `${title} (${author} - ${publicationYear})`;
  }
  return normalizedMetadataText(record?.fileName) || "Untitled EPUB";
};

const readingPositionForRecord = (record) => {
  const localPosition = record?.hash ? loadPosition(record.hash) : null;
  const serverPosition = record?.position && typeof record.position === "object"
    ? record.position
    : null;
  if (!localPosition) return serverPosition || {};
  if (!serverPosition) return localPosition;
  return Number(serverPosition.savedAt) > Number(localPosition.savedAt || 0)
    ? serverPosition
    : localPosition;
};

const positionRatio = (position) => {
  const storedRatio = Number(position?.ratio);
  if (Number.isFinite(storedRatio)) return Math.max(0, Math.min(1, storedRatio));
  const characterOffset = Number(position?.characterOffset);
  const characterCount = Number(position?.characterCount);
  if (Number.isFinite(characterOffset) && characterCount > 0) {
    return Math.max(0, Math.min(1, characterOffset / characterCount));
  }
  return 0;
};

const simulatedPageLocation = (position, fallbackCharacterCount = 0) => {
  const characterCount = Number(position?.characterCount) || Number(fallbackCharacterCount);
  if (!(characterCount > 0)) return null;
  const total = Math.max(1, Math.ceil(characterCount / SIMULATED_PAGE_CHARACTERS));
  const storedOffset = Number(position?.characterOffset);
  const offset = Number.isFinite(storedOffset)
    ? Math.max(0, Math.min(characterCount, storedOffset))
    : positionRatio(position) * characterCount;
  const current = Math.max(
    1,
    Math.min(total, Math.ceil(offset / SIMULATED_PAGE_CHARACTERS))
  );
  return { current, total };
};

const formatBookReadingLocation = (record) => {
  const position = readingPositionForRecord(record);
  const percentage = Math.round(positionRatio(position) * 100);
  const pages = simulatedPageLocation(position, record?.characterCount);
  return pages
    ? `(${percentage}%, ${pages.current}/${pages.total})`
    : `(${percentage}%)`;
};

const displayedLibraryBooks = () => {
  const combined = recentBookInfo.map((record) => ({ ...record }));
  serverBookInfo.forEach((serverRecord) => {
    const index = combined.findIndex((record) => booksMatch(record, serverRecord));
    if (index < 0) {
      combined.push({ ...serverRecord, serverStored: true });
      return;
    }
    const existing = combined[index];
    combined[index] = {
      ...serverRecord,
      ...existing,
      title: existing.title || serverRecord.title,
      author: existing.author || serverRecord.author,
      publicationYear: existing.publicationYear || serverRecord.publicationYear,
      fileName: existing.fileName || serverRecord.fileName,
      openedAt: Math.max(
        Number(existing.openedAt) || 0,
        Number(serverRecord.openedAt) || 0
      ),
      coverUrl: serverRecord.coverUrl || "",
      serverStored: true
    };
  });
  return combined
    .sort((first, second) => (Number(second.openedAt) || 0) - (Number(first.openedAt) || 0));
};

const setServerLibraryAvailable = (available) => {
  serverLibraryAvailable = Boolean(available);
  startStoreServer.hidden = !serverLibraryAvailable;
  startRemoveServer.hidden = !serverLibraryAvailable;
};

const refreshServerLibrary = async (silent = false) => {
  try {
    const payload = await serverRequest("/api/library/books");
    serverBookInfo = Array.isArray(payload.books) ? payload.books : [];
    serverBookHashes.clear();
    serverBookInfo.forEach((record) => {
      if (/^[a-f0-9]{64}$/.test(record?.hash || "")) serverBookHashes.add(record.hash);
    });
    setServerLibraryAvailable(true);
    renderRecentBooks();
    return true;
  } catch (error) {
    setServerLibraryAvailable(false);
    serverBookInfo = [];
    serverBookHashes.clear();
    renderRecentBooks();
    if (!silent) showStatus(`SERVER LIBRARY ERROR · ${error.message}`, 3200);
    return false;
  }
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

const libraryBookKey = (record) => record?.hash
  ? `hash:${record.hash}`
  : `file:${record?.fileName || ""}`;

const syncLibraryManageControls = () => {
  const displayed = displayedLibraryBooks();
  const selected = displayed.filter((record) =>
    selectedLibraryBooks.has(libraryBookKey(record))
  );
  const hasLocalSelection = selected.some((record) =>
    recentBookInfo.some((candidate) => booksMatch(candidate, record)) ||
    Boolean(cachedRecordFor(record)?.bytes)
  );
  const hasUploadSelection = selected.some((record) =>
    Boolean(cachedRecordFor(record)?.bytes) && !serverBookHashes.has(record.hash)
  );
  const hasServerSelection = selected.some((record) =>
    serverBookHashes.has(record.hash)
  );
  const busy = isBookLoading || serverLibraryBusy;
  startManageLibrary.disabled = busy || displayed.length === 0;
  libraryManageActions.hidden = !libraryManageMode;
  startStoreServer.disabled = busy || !hasUploadSelection;
  startRemoveLocal.disabled = busy || !hasLocalSelection;
  startRemoveServer.disabled = busy || !hasServerSelection;
  startStoreServer.textContent = selectedLibraryBooks.size > 0
    ? `STORE ON SERVER (${selectedLibraryBooks.size})`
    : "STORE ON SERVER";
  if (libraryManageMode) recentBookList.classList.add("is-managing");
  else recentBookList.classList.remove("is-managing");
};

const setLibraryManageMode = (enabled) => {
  libraryManageMode = Boolean(
    enabled && displayedLibraryBooks().length > 0 && !isBookLoading && !serverLibraryBusy
  );
  if (!libraryManageMode) selectedLibraryBooks.clear();
  syncLibraryManageControls();
  renderRecentBooks();
};

const toggleLibraryBookSelection = (record) => {
  const key = libraryBookKey(record);
  if (selectedLibraryBooks.has(key)) selectedLibraryBooks.delete(key);
  else selectedLibraryBooks.add(key);
  syncLibraryManageControls();
  renderRecentBooks();
};

const renderRecentBooks = () => {
  recentBookList.replaceChildren();
  const displayed = displayedLibraryBooks();
  recentBooks.hidden = displayed.length === 0;

  displayed.forEach((record, index) => {
    const cached = cachedRecordFor(record);
    const serverRecord = serverRecordFor(record);
    const serverStored = Boolean(serverRecord || serverBookHashes.has(record.hash));
    const button = document.createElement("button");
    const selectionKey = libraryBookKey(record);
    const isSelected = selectedLibraryBooks.has(selectionKey);
    button.type = "button";
    button.className = "recent-book";
    button.disabled = isBookLoading || serverLibraryBusy || (
      !libraryManageMode && !cached?.bytes && !serverStored
    );
    const bookName = formatBookMetadataTitle(record);
    const locationText = formatBookReadingLocation(record);
    const titleLabel = document.createElement("span");
    titleLabel.className = "recent-book-title";
    titleLabel.textContent = bookName;
    const locationLabel = document.createElement("span");
    locationLabel.className = "recent-book-location";
    locationLabel.textContent = locationText;
    button.appendChild(titleLabel);
    button.appendChild(locationLabel);
    button.setAttribute("aria-label", `${bookName} · ${locationText}`);
    const cover = cached?.thumbnail || serverRecord?.coverUrl || "";
    if (cover) {
      button.classList.add("has-cover");
      button.style.setProperty("--recent-book-cover", `url("${cover}")`);
    }
    if (serverStored) button.classList.add("is-server-stored");
    else button.classList.add("is-client-only");
    if (libraryManageMode) {
      if (isSelected) button.classList.add("is-selected");
      button.setAttribute("aria-pressed", String(isSelected));
      button.title = `${isSelected ? "Deselect" : "Select"} ${bookName}`;
      button.addEventListener("click", () => toggleLibraryBookSelection(record));
    } else {
      button.title = `${serverStored ? "Server stored" : "Client only"} · ${bookName}`;
      button.addEventListener("click", () => void openLibraryBook(record));
    }
    recentBookList.appendChild(button);

    if (index === 0) {
      lastBookCanReopen = Boolean(cached?.bytes || serverStored);
      setReopenAvailability(lastBookCanReopen);
    }
  });

  if (displayed.length === 0) {
    lastBookCanReopen = false;
    setReopenAvailability(false);
  }
  syncLibraryManageControls();
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
      const store = transaction.objectStore(LAST_BOOK_STORE);
      store.put(records, RECENT_BOOKS_RECORD);
      store.delete(LAST_BOOK_RECORD);
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

const createCoverThumbnail = async (bookInstance, archiveCoverPromise = null) => {
  if (typeof window.createImageBitmap !== "function") return "";

  let blob = null;
  if (
    typeof bookInstance?.coverUrl === "function" &&
    typeof window.fetch === "function"
  ) {
    try {
      const coverUrl = await bookInstance.coverUrl();
      if (coverUrl) {
        const response = await window.fetch(coverUrl);
        const candidate = response.ok ? await response.blob() : null;
        if (candidate?.type?.startsWith("image/")) blob = candidate;
      }
    } catch (error) {
      console.warn("EPUB.js could not resolve the cover; trying the OPF fallback.", error);
    }
  }

  if (!blob && archiveCoverPromise) {
    try {
      const archiveCover = await archiveCoverPromise;
      if (archiveCover?.bytes && archiveCover?.type?.startsWith("image/")) {
        blob = new Blob([archiveCover.bytes], { type: archiveCover.type });
      }
    } catch (error) {
      console.warn("Could not read the OPF cover fallback.", error);
    }
  }
  if (!blob) return "";

  try {
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
      const packageMetadata = await validateEpubBytes(cached.bytes);
      coverBook = ePub(cached.bytes);
      await coverBook.opened;
      await coverBook.ready;
      const thumbnail = await createCoverThumbnail(
        coverBook,
        packageMetadata.coverImagePromise
      );
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

const recentBooksReady = Promise.all([
  initializeRecentBooks(),
  refreshServerLibrary(true)
]);

const removeSelectedClientBooks = async () => {
  if (isBookLoading || selectedLibraryBooks.size === 0) return;
  const selectedRecords = displayedLibraryBooks().filter((record) =>
    selectedLibraryBooks.has(libraryBookKey(record)) && (
      recentBookInfo.some((candidate) => booksMatch(candidate, record)) ||
      Boolean(cachedRecordFor(record)?.bytes)
    )
  );
  if (selectedRecords.length === 0) return;

  const count = selectedRecords.length;
  const prompt = count === 1
    ? "Remove this book, its reading position, and its settings from this device? Any server copy will be kept."
    : `Remove these ${count} books, their reading positions, and their settings from this device? Any server copies will be kept.`;
  if (!window.confirm(prompt)) return;

  const removedHashes = new Set();
  selectedRecords.forEach((record) => {
    if (record.hash) removedHashes.add(record.hash);
    const cached = cachedRecentBooks.find((candidate) => booksMatch(record, candidate));
    if (cached?.hash) removedHashes.add(cached.hash);
  });
  const activeBookWasRemoved = Boolean(
    activeBookKey && removedHashes.has(activeBookKey)
  );
  const retainedCachedBooks = cachedRecentBooks.filter((cached) =>
    !selectedRecords.some((record) => booksMatch(record, cached))
  );

  try {
    if (activeBookWasRemoved && serverBookHashes.has(activeBookKey)) {
      await syncServerBookState(activeBookKey);
    }
    await writeCachedBooks(retainedCachedBooks);
    if (activeBookWasRemoved) {
      destroyCurrentBook();
      activeBookKey = null;
      activeBookTitle = "";
      readerScrollBeforeHome = 0;
      replaceHomeHistory();
    }

    removedHashes.forEach((hash) => {
      localStorage.removeItem(positionKey(hash));
      localStorage.removeItem(bookSettingsKey(hash));
    });
    recentBookInfo = recentBookInfo.filter((record) =>
      !selectedLibraryBooks.has(libraryBookKey(record))
    );
    cachedRecentBooks = retainedCachedBooks;
    if (recentBookInfo.length > 0) {
      localStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(recentBookInfo));
      localStorage.setItem(LAST_BOOK_KEY, JSON.stringify(recentBookInfo[0]));
    } else {
      localStorage.removeItem(RECENT_BOOKS_KEY);
      localStorage.removeItem(LAST_BOOK_KEY);
    }
    lastBookCanReopen = Boolean(
      cachedRecentBooks.find((cached) => booksMatch(recentBookInfo[0], cached))?.bytes
    );
    setLibraryManageMode(false);
    setReopenAvailability(lastBookCanReopen);
    showStatus(
      `${count} ${count === 1 ? "BOOK" : "BOOKS"} REMOVED FROM THIS DEVICE`,
      2200
    );
  } catch (error) {
    console.error(error);
    showStatus("BOOKS COULD NOT BE REMOVED", 2400);
  }
};

const populateSelect = (select, choices) => {
  choices.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.id;
    option.textContent = choice.name;
    select.appendChild(option);
  });
};

const appendPaletteSwatches = (container, palette) => {
  container.replaceChildren();
  palette.swatches.forEach((color) => {
    const swatch = document.createElement("i");
    swatch.style.setProperty("--swatch-color", color);
    container.appendChild(swatch);
  });
};

const setPalettePickerOpen = (isOpen) => {
  settingsPaletteOptions.hidden = !isOpen;
  settingsPaletteToggle.setAttribute("aria-expanded", String(isOpen));
};

const syncPalettePicker = () => {
  const palette = PALETTES[paletteIndex];
  settingsPaletteName.textContent = palette.name;
  appendPaletteSwatches(settingsPaletteSwatches, palette);
  for (const option of settingsPaletteOptions.children) {
    option.setAttribute(
      "aria-selected",
      String(option.dataset.paletteId === palette.id)
    );
  }
};

const renderPaletteOptions = () => {
  settingsPaletteOptions.replaceChildren();
  PALETTES.forEach((palette, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "palette-option";
    option.dataset.paletteId = palette.id;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");

    const name = document.createElement("span");
    name.textContent = palette.name;
    option.appendChild(name);

    const swatches = document.createElement("span");
    swatches.className = "palette-swatches";
    swatches.setAttribute("aria-hidden", "true");
    appendPaletteSwatches(swatches, palette);
    option.appendChild(swatches);

    option.addEventListener("click", () => {
      applyPalette(index);
      setPalettePickerOpen(false);
      settingsPaletteToggle.focus?.();
    });
    settingsPaletteOptions.appendChild(option);
  });
};

populateSelect(settingsPaletteSelect, PALETTES);
populateSelect(settingsFontSelect, FONTS);
renderPaletteOptions();

const getAnchorViewportRect = (anchor) => {
  if (!anchor) return null;

  if (anchor.element) {
    return anchor.element.getBoundingClientRect?.() || null;
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
    return range.getBoundingClientRect();
  } catch {
    return null;
  }
};

const getAnchorViewportTop = (anchor) => {
  const rectangle = getAnchorViewportRect(anchor);
  return Number.isFinite(rectangle?.top) ? rectangle.top : null;
};

const visibleViewportBounds = () => {
  const visualViewport = window.visualViewport;
  const top = Number.isFinite(Number(visualViewport?.offsetTop))
    ? Number(visualViewport.offsetTop)
    : 0;
  const left = Number.isFinite(Number(visualViewport?.offsetLeft))
    ? Number(visualViewport.offsetLeft)
    : 0;
  const width = Number.isFinite(Number(visualViewport?.width))
    ? Number(visualViewport.width)
    : window.innerWidth;
  const height = Number.isFinite(Number(visualViewport?.height))
    ? Number(visualViewport.height)
    : window.innerHeight;
  return { top, right: left + width, bottom: top + height, left, width, height };
};

const fullyVisibleTextRect = (rectangle, viewport) => (
  rectangle &&
  rectangle.height > 0 &&
  rectangle.width > 0 &&
  rectangle.top >= viewport.top - 0.5 &&
  rectangle.bottom <= viewport.bottom + 0.5 &&
  rectangle.right >= viewport.left &&
  rectangle.left <= viewport.right
);

const textNodeOffsetForLineRect = (node, lineRect) => {
  const length = node?.textContent?.length || 0;
  if (length <= 0) return 0;
  const probe = document.createRange();
  const rectangleAt = (offset) => {
    const index = Math.max(0, Math.min(length - 1, offset));
    probe.setStart(node, index);
    probe.setEnd(node, index + 1);
    return probe.getBoundingClientRect();
  };

  let low = 0;
  let high = length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const rectangle = rectangleAt(middle);
    if (!Number.isFinite(rectangle?.bottom) || rectangle.bottom <= lineRect.top + 0.5) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const first = Math.max(0, low - 4);
  const last = Math.min(length - 1, low + 12);
  for (let offset = first; offset <= last; offset += 1) {
    const rectangle = rectangleAt(offset);
    if (
      rectangle?.height > 0 &&
      rectangle.bottom > lineRect.top + 0.5 &&
      rectangle.top < lineRect.bottom - 0.5
    ) return offset;
  }
  return low;
};

const captureFirstFullyVisibleTextAnchorFromDom = (viewport) => {
  if (typeof document.createTreeWalker !== "function") return null;
  const chapters = [...viewer.querySelectorAll(".book-section")].filter((chapter) => {
    const rectangle = chapter.getBoundingClientRect();
    return rectangle.bottom > viewport.top && rectangle.top < viewport.bottom;
  });

  for (const chapter of chapters) {
    const walker = document.createTreeWalker(chapter, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent || !/\S/.test(node.textContent)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rectangles = [...range.getClientRects()]
        .filter((rectangle) => fullyVisibleTextRect(rectangle, viewport))
        .sort((first, second) => first.top - second.top || first.left - second.left);
      const rectangle = rectangles[0];
      if (!rectangle) continue;
      const offset = textNodeOffsetForLineRect(node, rectangle);
      return {
        node,
        offset,
        viewportTop: rectangle.top,
        viewportRatio: (rectangle.top - viewport.top) / Math.max(1, viewport.height)
      };
    }
  }
  return null;
};

const captureFirstFullyVisibleTextAnchor = () => {
  if (
    reader.hidden ||
    !pageIsVisible() ||
    viewer.children.length === 0 ||
    typeof document.createRange !== "function"
  ) return null;

  const viewport = visibleViewportBounds();
  const x = viewport.left + viewport.width / 2;
  const firstY = viewport.top + 1;
  const lastY = Math.max(firstY, viewport.bottom - 1);

  for (let y = firstY; y <= lastY; y += FIRST_VISIBLE_LINE_SCAN_STEP_PX) {
    const caret = document.caretPositionFromPoint?.(x, y);
    const legacyCaret = caret ? null : document.caretRangeFromPoint?.(x, y);
    const node = caret?.offsetNode || legacyCaret?.startContainer;
    const rawOffset = caret?.offset ?? legacyCaret?.startOffset ?? 0;
    if (!node || node.nodeType !== 3 || !(node.textContent?.length > 0)) continue;

    const parent = node.parentElement;
    if (parent?.closest && !parent.closest("#viewer")) continue;
    const offset = Math.max(0, Math.min(rawOffset, node.textContent.length - 1));
    const anchor = { node, offset };
    const rectangle = getAnchorViewportRect(anchor);
    if (fullyVisibleTextRect(rectangle, viewport)) {
      return {
        ...anchor,
        viewportTop: rectangle.top,
        viewportRatio: (rectangle.top - viewport.top) / Math.max(1, viewport.height)
      };
    }
  }

  // Mobile caret hit-testing is not reliable in every browser/layout. Fall back to
  // the rendered DOM itself so position persistence still gets a text anchor.
  return captureFirstFullyVisibleTextAnchorFromDom(viewport);
};

const captureLayoutAnchor = () => {
  if (reader.hidden || viewer.children.length === 0) return null;
  const textAnchor = captureFirstFullyVisibleTextAnchor();
  if (textAnchor) return textAnchor;

  const viewport = visibleViewportBounds();
  const x = viewport.left + viewport.width / 2;
  const y = viewport.top + FIRST_VISIBLE_LINE_TOP_PADDING_PX;
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

const scheduleServerStateSync = (hash = activeBookKey, immediate = false) => {
  if (!hash || !serverLibraryAvailable || !serverBookHashes.has(hash)) return;
  const existingTimer = serverStateSyncTimers.get(hash);
  if (existingTimer !== undefined) window.clearTimeout(existingTimer);
  const timer = window.setTimeout(() => {
    serverStateSyncTimers.delete(hash);
    void syncServerBookState(hash);
  }, immediate ? 0 : SERVER_STATE_SYNC_DELAY_MS);
  serverStateSyncTimers.set(hash, timer);
};

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
  speechCenterOffset: speechCenterOffsetPercent,
  speechSpeed: speechSpeedPercent
});

const saveCurrentReadingSettings = (fallbackKey = "", fallbackValue = "") => {
  if (suppressSettingsPersistence) return;
  if (activeBookKey) {
    localStorage.setItem(
      bookSettingsKey(activeBookKey),
      JSON.stringify({ ...captureReadingSettings(), savedAt: Date.now() })
    );
    scheduleServerStateSync(activeBookKey);
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
    suppressSettingsPersistence = true;
    try {
      applyDefaultReadingSettings();
    } finally {
      suppressSettingsPersistence = false;
    }
    localStorage.setItem(
      bookSettingsKey(hash),
      JSON.stringify({ ...captureReadingSettings(), savedAt: 0 })
    );
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
    const storedSpeechSpeed = stored.speechSpeed ?? localStorage.getItem(SPEECH_SPEED_KEY);
    if (storedSpeechSpeed !== null && storedSpeechSpeed !== "" &&
        Number.isFinite(Number(storedSpeechSpeed))) {
      applySpeechSpeed(Number(storedSpeechSpeed));
    }
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

  settingsPaletteSelect.value = paletteId;
  syncPalettePicker();
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
    showStatus(
      `PALETTE ${paletteIndex + 1}/${PALETTES.length} · ${palette.name}`,
      FONT_PALETTE_STATUS_DURATION_MS
    );
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
    showStatus(
      `FONT ${fontIndex + 1}/${FONTS.length} · ${font.name}`,
      FONT_PALETTE_STATUS_DURATION_MS
    );
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

function applyDefaultReadingSettings() {
  const defaultFontIndex = FONTS.findIndex((font) => font.id === "alegreya");
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
  applySpeechSpeed(DEFAULT_SPEECH_SPEED_PERCENT);
}

const resetCurrentBookSettings = () => {
  if (!activeBookKey) return;

  suppressSettingsPersistence = true;
  try {
    applyDefaultReadingSettings();
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
      author: existing.author || imported.author,
      publicationYear: existing.publicationYear || imported.publicationYear,
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

const storedValueSavedAt = (value) => {
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

    if (key.startsWith(POSITION_PREFIX) || key.startsWith(BOOK_SETTINGS_PREFIX)) {
      const existing = localStorage.getItem(key);
      if (existing && storedValueSavedAt(existing) > storedValueSavedAt(value)) continue;
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
  if (!isOpen) setPalettePickerOpen(false);
  document.body.classList[isOpen ? "add" : "remove"]("settings-open");
  settingsToggle.setAttribute("aria-expanded", String(isOpen));
  settingsToggle.setAttribute(
    "aria-label", isOpen ? "Close reader settings" : "Open reader settings"
  );
  settingsToggle.title = isOpen ? "Close reader settings" : "Reader settings";
};

const fullscreenElement = () => (
  document.fullscreenElement || document.webkitFullscreenElement || null
);

const fullscreenRequest = document.documentElement.requestFullscreen
  || document.documentElement.webkitRequestFullscreen;
const fullscreenExit = document.exitFullscreen || document.webkitExitFullscreen;
const fullscreenAvailable = (
  document.fullscreenEnabled !== false
  && typeof fullscreenRequest === "function"
  && typeof fullscreenExit === "function"
);

const syncFullscreenToggle = () => {
  const isFullscreen = Boolean(fullscreenElement());
  fullscreenToggle.hidden = !fullscreenAvailable;
  fullscreenToggle.setAttribute("aria-pressed", String(isFullscreen));
  fullscreenToggle.setAttribute(
    "aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
  );
  fullscreenToggle.title = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
};

const toggleFullscreen = async () => {
  if (!fullscreenAvailable) return;
  try {
    if (fullscreenElement()) await fullscreenExit.call(document);
    else await fullscreenRequest.call(document.documentElement);
  } catch (error) {
    showStatus(`FULLSCREEN ERROR · ${error?.message || "Fullscreen is unavailable"}`, 2600);
  } finally {
    syncFullscreenToggle();
  }
};

syncFullscreenToggle();

const setReadingMode = (isReading) => {
  if (isReading && libraryManageMode) {
    libraryManageMode = false;
    selectedLibraryBooks.clear();
    syncLibraryManageControls();
  }
  document.documentElement.dataset.view = isReading ? "reader" : "home";
  dropZone.hidden = isReading;
  reader.hidden = !isReading;
  settingsMenu.hidden = !isReading;
  readingLocation.hidden = !isReading;
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

const indexBookCharacterMetrics = () => {
  let total = 0;
  let hasText = false;
  for (const chapter of viewer.children) {
    const count = normalizedCharacterCount(chapter.textContent);
    if (count > 0 && hasText) total += 1;
    chapter.dataset.characterStart = String(total);
    chapter.dataset.characterCount = String(count);
    total += count;
    if (count > 0) hasText = true;
  }
  activeBookCharacterCount = total;
  return total;
};

const updateReadingProgress = (position = null) => {
  if (reader.hidden) return;
  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - visibleViewportBounds().height
  );
  const ratio = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  const percentage = Math.round(ratio * 100);
  readingProgress.textContent = `${Math.max(0, Math.min(100, percentage))}%`;
  const pages = simulatedPageLocation(
    position || { ratio, characterCount: activeBookCharacterCount },
    activeBookCharacterCount
  );
  readingPages.hidden = !pages;
  if (pages) readingPages.textContent = `${pages.current}/${pages.total}`;
};

const captureTextPositionAnchor = () => {
  if (reader.hidden || typeof document.createRange !== "function") return null;
  const visibleAnchor = captureFirstFullyVisibleTextAnchor();
  const node = visibleAnchor?.node;
  const offset = visibleAnchor?.offset ?? 0;
  const element = node?.nodeType === 1 ? node : node?.parentElement;
  const chapter = element?.closest?.(".book-section");
  if (!node || !chapter || typeof chapter.dataset?.spineIndex !== "string") return null;

  try {
    const range = document.createRange();
    if (typeof range.selectNodeContents !== "function") return null;
    range.selectNodeContents(chapter);
    range.setEnd(node, offset);
    const textOffset = range.toString().length;
    const chapterStart = Number(chapter.dataset.characterStart) || 0;
    const chapterCharacters = Number(chapter.dataset.characterCount) || 0;
    return {
      spineIndex: Number(chapter.dataset.spineIndex),
      textOffset,
      characterOffset: chapterStart + Math.min(
        chapterCharacters,
        normalizedCharacterCount(range.toString())
      ),
      viewportRatio: visibleAnchor.viewportRatio,
      placement: "first-visible-line"
    };
  } catch {
    return null;
  }
};

const restoreTextPositionAnchor = (anchor) => {
  if (
    !anchor ||
    !Number.isInteger(Number(anchor.spineIndex)) ||
    !Number.isFinite(Number(anchor.textOffset)) ||
    typeof viewer.querySelector !== "function"
  ) return false;
  const chapter = viewer.querySelector(
    `.book-section[data-spine-index="${Number(anchor.spineIndex)}"]`
  );
  if (!chapter) return false;
  let remaining = Math.max(0, Number(anchor.textOffset));
  const walker = document.createTreeWalker(chapter, 4);
  let node = walker.nextNode();
  while (node && remaining > (node.textContent?.length || 0)) {
    remaining -= node.textContent?.length || 0;
    node = walker.nextNode();
  }
  if (!node) return false;
  try {
    const range = document.createRange();
    const offset = Math.max(0, Math.min(remaining, node.textContent?.length || 0));
    range.setStart(node, offset);
    range.setEnd(node, Math.min(offset + 1, node.textContent?.length || 0));
    const rectangle = range.getBoundingClientRect();
    if (!Number.isFinite(rectangle?.top)) return false;
    const viewport = visibleViewportBounds();
    const legacyViewportRatio = Number.isFinite(Number(anchor.viewportRatio))
      ? Math.max(0.08, Math.min(0.8, Number(anchor.viewportRatio)))
      : 0.32;
    const targetViewportTop = anchor.placement === "first-visible-line"
      ? viewport.top + Math.min(
        FIRST_VISIBLE_LINE_TOP_PADDING_PX,
        Math.max(1, viewport.height * 0.02)
      )
      : viewport.top + viewport.height * legacyViewportRatio;
    window.scrollTo(
      0,
      Math.max(0, window.scrollY + rectangle.top - targetViewportTop)
    );
    return true;
  } catch {
    return false;
  }
};

const cheapVisiblePositionSnapshot = () => {
  if (
    positionPersistenceSuspended ||
    !activeBookKey ||
    reader.hidden ||
    !pageIsVisible()
  ) return null;
  const viewport = visibleViewportBounds();
  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - viewport.height
  );
  const ratio = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  const characterCount = activeBookCharacterCount || 0;
  return {
    bookKey: activeBookKey,
    position: {
      scrollY: window.scrollY,
      ratio,
      anchor: null,
      characterOffset: Math.round(ratio * characterCount),
      characterCount,
      savedAt: Date.now()
    }
  };
};

const rememberVisibleScrollPosition = () => {
  const snapshot = cheapVisiblePositionSnapshot();
  if (snapshot) lastVisibleScrollSnapshot = snapshot;
};

const savePositionRecord = (bookKey, position) => {
  if (!bookKey || !position) return;
  localStorage.setItem(positionKey(bookKey), JSON.stringify(position));
  if (bookKey === activeBookKey) updateReadingProgress(position);
  scheduleServerStateSync(bookKey);
};

const savePositionNow = () => {
  if (positionPersistenceSuspended || !activeBookKey || reader.hidden) return;

  const previousPosition = loadPosition(activeBookKey) || {};
  if (!pageIsVisible()) {
    const candidates = [lastVisiblePositionSnapshot, lastVisibleScrollSnapshot]
      .filter((snapshot) => snapshot?.bookKey === activeBookKey && snapshot.position);
    const latest = candidates.sort((first, second) => (
      Number(second.position.savedAt || 0) - Number(first.position.savedAt || 0)
    ))[0];
    if (!latest) return;
    // Do not recalculate DOM geometry after the browser has hidden/frozen the page.
    savePositionRecord(activeBookKey, {
      ...latest.position,
      savedAt: Date.now()
    });
    return;
  }

  const viewport = visibleViewportBounds();
  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - viewport.height
  );
  const ratio = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  const capturedAnchor = captureTextPositionAnchor();
  const characterCount = activeBookCharacterCount ||
    Math.max(0, Number(previousPosition.characterCount) || 0);
  const capturedCharacterOffset = Number(capturedAnchor?.characterOffset);
  const characterOffset = Number.isFinite(capturedCharacterOffset)
    ? capturedCharacterOffset
    : Math.round(ratio * characterCount);
  const position = {
    scrollY: window.scrollY,
    ratio,
    anchor: capturedAnchor,
    characterOffset,
    characterCount,
    savedAt: Date.now()
  };
  lastVisiblePositionSnapshot = { bookKey: activeBookKey, position };
  lastVisibleScrollSnapshot = { bookKey: activeBookKey, position };
  savePositionRecord(activeBookKey, position);
};

const schedulePositionSave = () => {
  window.clearTimeout(saveTimer);
  if (positionPersistenceSuspended) return;
  saveTimer = window.setTimeout(savePositionNow, SAVE_DELAY_MS);
};

const settingsSavedAt = (settings) => {
  const savedAt = Number(settings?.savedAt);
  return Number.isFinite(savedAt) ? savedAt : 0;
};

const mergeServerBookState = (bookHash, state) => {
  if (!state || state.hash !== bookHash) return;
  const remotePosition = state.position;
  const localPosition = loadPosition(bookHash);
  if (
    remotePosition &&
    Number(remotePosition.savedAt) >= Number(localPosition?.savedAt || 0)
  ) {
    localStorage.setItem(positionKey(bookHash), JSON.stringify(remotePosition));
  }

  const remoteSettings = state.settings;
  const localSettings = readBookSettings(bookHash);
  if (remoteSettings && settingsSavedAt(remoteSettings) >= settingsSavedAt(localSettings)) {
    localStorage.setItem(bookSettingsKey(bookHash), JSON.stringify(remoteSettings));
  }
};

const serverStateForBook = (bookHash) => {
  const recentMetadata = recentBookInfo.find((record) => record.hash === bookHash) || {};
  const cachedMetadata = cachedRecentBooks.find((record) => record.hash === bookHash) || {};
  const serverMetadata = serverBookInfo.find((record) => record.hash === bookHash) || {};
  return {
    version: 1,
    hash: bookHash,
    fileName: recentMetadata.fileName || cachedMetadata.fileName ||
      serverMetadata.fileName || `${bookHash.slice(0, 12)}.epub`,
    title: recentMetadata.title || cachedMetadata.title || serverMetadata.title || "",
    author: recentMetadata.author || cachedMetadata.author || serverMetadata.author || "",
    publicationYear: recentMetadata.publicationYear ||
      cachedMetadata.publicationYear || serverMetadata.publicationYear || "",
    openedAt: Math.max(
      Number(recentMetadata.openedAt) || 0,
      Number(cachedMetadata.openedAt) || 0,
      Number(serverMetadata.openedAt) || 0
    ),
    position: loadPosition(bookHash) || {},
    settings: readBookSettings(bookHash) || {}
  };
};

const syncServerBookState = (bookHash = activeBookKey, keepalive = false) => {
  if (!bookHash || !serverLibraryAvailable || !serverBookHashes.has(bookHash)) {
    return Promise.resolve(false);
  }
  const previous = serverStateSyncing.get(bookHash) || Promise.resolve();
  const operation = previous
    .catch(() => {})
    .then(() => serverRequest(
      `/api/library/books/${bookHash}/state`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverStateForBook(bookHash)),
        keepalive
      }
    ))
    .then(() => true)
    .catch((error) => {
      console.warn("Could not synchronize server book state.", error);
      return false;
    });
  serverStateSyncing.set(bookHash, operation);
  operation.finally(() => {
    if (serverStateSyncing.get(bookHash) === operation) serverStateSyncing.delete(bookHash);
  });
  return operation;
};

const flushServerBookState = (bookHash = activeBookKey) => {
  const pendingTimer = serverStateSyncTimers.get(bookHash);
  if (pendingTimer !== undefined) {
    window.clearTimeout(pendingTimer);
    serverStateSyncTimers.delete(bookHash);
  }
  if (
    !bookHash ||
    !serverLibraryAvailable ||
    !serverBookHashes.has(bookHash) ||
    typeof window.fetch !== "function"
  ) return;
  void window.fetch(`/api/library/books/${bookHash}/state`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverStateForBook(bookHash)),
    keepalive: true
  }).catch(() => {});
};

const jpegBytesFromDataUrl = (dataUrl) => {
  const match = /^data:image\/jpeg;base64,(.+)$/i.exec(dataUrl || "");
  if (!match || typeof window.atob !== "function") return null;
  const decoded = window.atob(match[1]);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
};

const storeSelectedBooksOnServer = async () => {
  if (!serverLibraryAvailable || serverLibraryBusy || isBookLoading) return;
  const selected = displayedLibraryBooks().filter((record) =>
    selectedLibraryBooks.has(libraryBookKey(record)) &&
    Boolean(cachedRecordFor(record)?.bytes) &&
    !serverBookHashes.has(record.hash)
  );
  if (selected.length === 0) return;

  serverLibraryBusy = true;
  syncLibraryManageControls();
  try {
    for (const [index, record] of selected.entries()) {
      const cached = cachedRecordFor(record);
      showStatus(`UPLOADING ${index + 1} / ${selected.length} · ${record.title || record.fileName}`);
      await serverRequest(
        `/api/library/books/${record.hash}/epub`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/epub+zip" },
          body: cached.bytes
        },
        SERVER_LIBRARY_UPLOAD_TIMEOUT_MS
      );
      const cover = jpegBytesFromDataUrl(cached.thumbnail);
      if (cover?.byteLength) {
        try {
          await serverRequest(
            `/api/library/books/${record.hash}/cover`,
            {
              method: "PUT",
              headers: { "Content-Type": "image/jpeg" },
              body: cover
            },
            SERVER_LIBRARY_UPLOAD_TIMEOUT_MS
          );
        } catch (error) {
          console.warn("The book was stored without its cover.", error);
        }
      }
      await serverRequest(`/api/library/books/${record.hash}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverStateForBook(record.hash))
      });
      serverBookHashes.add(record.hash);
    }
    await refreshServerLibrary(true);
    setLibraryManageMode(false);
    showStatus(
      `${selected.length} ${selected.length === 1 ? "BOOK" : "BOOKS"} STORED ON SERVER`,
      2400
    );
  } catch (error) {
    console.error(error);
    showStatus(`SERVER UPLOAD ERROR · ${error.message}`, 5200);
  } finally {
    serverLibraryBusy = false;
    renderRecentBooks();
    syncLibraryManageControls();
  }
};

const removeSelectedServerBooks = async () => {
  if (!serverLibraryAvailable || serverLibraryBusy || isBookLoading) return;
  const selected = displayedLibraryBooks().filter((record) =>
    selectedLibraryBooks.has(libraryBookKey(record)) && serverBookHashes.has(record.hash)
  );
  if (selected.length === 0) return;
  const prompt = selected.length === 1
    ? "Remove this book and its synchronized state from the server? The copy on this device will be kept."
    : `Remove these ${selected.length} books and their synchronized state from the server? Copies on this device will be kept.`;
  if (!window.confirm(prompt)) return;

  serverLibraryBusy = true;
  syncLibraryManageControls();
  try {
    for (const [index, record] of selected.entries()) {
      showStatus(`REMOVING FROM SERVER ${index + 1} / ${selected.length}`);
      await serverRequest(`/api/library/books/${record.hash}`, { method: "DELETE" });
      serverBookHashes.delete(record.hash);
    }
    await refreshServerLibrary(true);
    setLibraryManageMode(false);
    showStatus(
      `${selected.length} ${selected.length === 1 ? "BOOK" : "BOOKS"} REMOVED FROM SERVER`,
      2400
    );
  } catch (error) {
    console.error(error);
    showStatus(`SERVER REMOVE ERROR · ${error.message}`, 4200);
  } finally {
    serverLibraryBusy = false;
    renderRecentBooks();
    syncLibraryManageControls();
  }
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
  activeBookCharacterCount = 0;
  lastVisiblePositionSnapshot = null;
  lastVisibleScrollSnapshot = null;
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
    event.target?.closest?.("#settings-menu, #speech-controls, #fullscreen-toggle")
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

const waitForImages = async (savedPosition = null) => {
  let images = [...viewer.querySelectorAll("img")];
  const targetSpine = Number(savedPosition?.anchor?.spineIndex);
  if (Number.isInteger(targetSpine)) {
    images = images.filter((image) => {
      const chapter = image.closest?.(".book-section");
      const spineIndex = Number(chapter?.dataset?.spineIndex);
      return !Number.isInteger(spineIndex) || spineIndex <= targetSpine;
    });
  }

  const pending = images
    .filter((image) => !image.complete)
    .map((image) => {
      // A full-DOM reader cannot wait for an off-screen lazy image forever.
      // Images that can affect the restored position are made eager explicitly.
      try { image.loading = "eager"; } catch {}
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(pending),
    new Promise((resolve) => window.setTimeout(resolve, IMAGE_LAYOUT_WAIT_MS))
  ]);
};

const restorePosition = async (savedPosition) => {
  await document.fonts?.ready;
  await waitForImages(savedPosition);
  await new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });

  const scrollRange = Math.max(
    0,
    document.documentElement.scrollHeight - visibleViewportBounds().height
  );
  const legacyRatio = Number(savedPosition?.percentage);
  const storedRatio = Number(savedPosition?.ratio);
  const storedY = Number(savedPosition?.scrollY);

  if (restoreTextPositionAnchor(savedPosition?.anchor)) {
    updateReadingProgress(savedPosition);
    return;
  }

  let target = 0;
  const characterOffset = Number(savedPosition?.characterOffset);
  const characterCount = Number(savedPosition?.characterCount);
  if (Number.isFinite(characterOffset) && characterCount > 0 && activeBookCharacterCount > 0) {
    target = Math.max(0, Math.min(1, characterOffset / characterCount)) * scrollRange;
  } else if (Number.isFinite(storedRatio)) {
    target = storedRatio * scrollRange;
  } else if (Number.isFinite(legacyRatio)) {
    target = legacyRatio * scrollRange;
  } else if (Number.isFinite(storedY)) {
    target = storedY;
  }

  window.scrollTo(0, Math.max(0, Math.min(scrollRange, target)));
  updateReadingProgress(savedPosition);
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

function applySpeechSpeed(nextSpeed, announce = false) {
  speechSpeedPercent = Math.round(Math.max(
    MIN_SPEECH_SPEED_PERCENT,
    Math.min(MAX_SPEECH_SPEED_PERCENT, nextSpeed)
  ));
  speechAudio.playbackRate = 1 + speechSpeedPercent / 100;
  if ("preservesPitch" in speechAudio) speechAudio.preservesPitch = true;
  saveCurrentReadingSettings(SPEECH_SPEED_KEY, speechSpeedPercent);
  settingsSpeechSpeed.value = String(speechSpeedPercent);
  settingsSpeechSpeedValue.textContent = (
    `${speechSpeedPercent > 0 ? "+" : ""}${speechSpeedPercent}%`
  );
  settingsSpeechSpeedDown.disabled = speechSpeedPercent <= MIN_SPEECH_SPEED_PERCENT;
  settingsSpeechSpeedUp.disabled = speechSpeedPercent >= MAX_SPEECH_SPEED_PERCENT;
  if (announce) {
    showStatus(
      `SPEECH SPEED · ${speechSpeedPercent > 0 ? "+" : ""}${speechSpeedPercent}%`,
      900
    );
  }
}

applySpeechSpeed(speechSpeedPercent);

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
    document.documentElement.scrollHeight - visibleViewportBounds().height
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
  const viewport = visibleViewportBounds();
  const fittingMargin = Math.max(0, (viewport.height - rangeHeight) / 2);
  const margin = Math.min(
    SPEECH_VIEWPORT_MARGIN_PX,
    viewport.height / 4,
    fittingMargin
  );
  return {
    top: viewport.top + margin,
    bottom: Math.max(viewport.top + margin, viewport.bottom - margin),
    height: viewport.height
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
    (visibleViewportBounds().top + visibleViewportBounds().height / 2) +
    visibleViewportBounds().height * (speechCenterOffsetPercent / 100)
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
    const selectedElements = [...new Set(
      (speechActiveJob.segments || []).map((segment) => segment.element).filter(Boolean)
    )];
    const leftEdges = [
      ...rects.map((rect) => rect.left),
      ...selectedElements.map((element) => element.getBoundingClientRect?.()?.left)
    ].filter(Number.isFinite);
    const selectionLeft = leftEdges.length > 0 ? Math.min(...leftEdges) : firstRect.left;
    speechMarker.style.left = `${(window.scrollX || 0) + Math.max(8, selectionLeft - 18)}px`;
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

// EPUB quotations and lists commonly nest selectable blocks, for example
// <blockquote><p>…</p></blockquote>. Reading both the container and its child
// would enqueue the same words twice. Keep only the deepest matching blocks so
// every rendered passage has one speech source and one marker range.
const speechBlockElements = () => {
  const blocks = [...viewer.querySelectorAll(SPEECH_BLOCK_SELECTOR)];
  const blockSet = new Set(blocks);
  const containersWithSpeechChildren = new Set();

  blocks.forEach((block) => {
    let ancestor = block.parentElement;
    while (ancestor && ancestor !== viewer) {
      if (blockSet.has(ancestor)) containersWithSpeechChildren.add(ancestor);
      ancestor = ancestor.parentElement;
    }
  });

  return blocks.filter((block) => !containersWithSpeechChildren.has(block));
};

const speechEntriesInViewport = (viewportTop, viewportBottom, afterCursor = null) => {
  const blocks = speechBlockElements();
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
  visibleViewportBounds().top + 8,
  Math.max(visibleViewportBounds().top + 8, visibleViewportBounds().bottom - 8),
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
  if (range.height > visibleViewportBounds().height) {
    return range.top < viewport.bottom && range.bottom > viewport.top;
  }
  const fitsPreferredBounds = (
    range.top >= viewport.top - 1 && range.bottom <= viewport.bottom + 1
  );
  const fitsPhysicalViewport = (
    range.top >= visibleViewportBounds().top - 1 && range.bottom <= visibleViewportBounds().bottom + 1
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
  const blocks = speechBlockElements();
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
      visibleViewportBounds().top + 8 + offset,
      Math.max(visibleViewportBounds().top + 8 + offset, visibleViewportBounds().bottom - 8 + offset),
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

const releasePrefetchedAudio = (prepared) => {
  const blobUrl = prepared?.prefetchedAudioUrl;
  if (!blobUrl || !speechPrefetchedUrls.has(blobUrl)) return;
  URL.revokeObjectURL(blobUrl);
  speechPrefetchedUrls.delete(blobUrl);
};

const cancelSpeechPreloads = () => {
  speechPrefetchControllers.forEach((controller) => controller.abort());
  speechPrefetchControllers.clear();
  speechPrefetchedUrls.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
  speechPrefetchedUrls.clear();
};

const preloadPreparedAudio = async (prepared, generation) => {
  if (
    prepared?.audioFormat !== "opus" ||
    !prepared.audioUrl ||
    generation !== speechGeneration ||
    typeof AbortController !== "function" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) return prepared;

  const controller = new AbortController();
  speechPrefetchControllers.add(controller);
  try {
    const response = await window.fetch(prepared.audioUrl, {
      signal: controller.signal,
      credentials: "same-origin"
    });
    if (!response.ok || typeof response.blob !== "function") return prepared;
    const blob = await response.blob();
    if (controller.signal.aborted || generation !== speechGeneration || blob.size === 0) {
      return prepared;
    }
    const prefetchedAudioUrl = URL.createObjectURL(blob);
    speechPrefetchedUrls.add(prefetchedAudioUrl);
    return { ...prepared, prefetchedAudioUrl };
  } catch {
    // Preloading is an optimization. Normal URL playback remains the fallback.
    return prepared;
  } finally {
    speechPrefetchControllers.delete(controller);
  }
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
  speechAudio.src = prepared.prefetchedAudioUrl || prepared.audioUrl;
  speechAudio.load();
  speechAudio.playbackRate = 1 + speechSpeedPercent / 100;
  if ("preservesPitch" in speechAudio) speechAudio.preservesPitch = true;
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
    releasePrefetchedAudio(prepared);
  }
};

const currentBookMediaMetadata = () => {
  const record = recentBookInfo.find((candidate) => candidate.hash === activeBookKey) || {};
  return {
    title: record.title || activeBookTitle?.replace(/ — Smooth Reader$/, "") || "Smooth Reader",
    artist: record.author || "Smooth Reader"
  };
};

const setPlaybackAudioSession = (playing) => {
  try {
    if ("audioSession" in navigator) navigator.audioSession.type = playing ? "playback" : "auto";
  } catch {}
};

const updateMediaSession = (active) => {
  if (!("mediaSession" in navigator)) return;
  try {
    if (active && typeof MediaMetadata === "function") {
      navigator.mediaSession.metadata = new MediaMetadata(currentBookMediaMetadata());
    } else if (!active) {
      navigator.mediaSession.metadata = null;
    }
    navigator.mediaSession.playbackState = active
      ? (speechIsPaused ? "paused" : "playing")
      : "none";
  } catch {}
};

try {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => {
      if (speechIsActive && speechIsPaused) void toggleSpeechPause();
      else if (!speechIsActive) void startSpeech();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (speechIsActive && !speechIsPaused) void toggleSpeechPause();
    });
    navigator.mediaSession.setActionHandler("stop", () => stopSpeech());
  }
} catch {}

const stopSpeech = () => {
  const wasActive = speechIsActive;
  speechGeneration += 1;
  speechIsActive = false;
  speechIsPaused = false;
  clearSpeechIndicators();
  releaseSpeechAudio();
  cancelSpeechPreloads();
  clearSpeechSelection();
  syncSpeechControls();
  setPlaybackAudioSession(false);
  updateMediaSession(false);

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
    updateMediaSession(true);
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
  cancelSpeechPreloads();
  unlockSpeechAudio();
  const generation = ++speechGeneration;
  speechIsActive = true;
  speechIsPaused = false;
  setPlaybackAudioSession(true);
  updateMediaSession(true);
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
      .then((value) => preloadPreparedAudio(value, generation))
      .then((value) => ({ value }), (error) => ({ error }));

    const viewportReading = !selectedText;
    let viewportCursor = null;
    let firstBatch = true;
    let queuedLogicalPreparation = null;

    const jobStartsAtSameLogicalText = (left, right) => {
      if (!left || !right || left.text !== right.text) return false;
      const leftSegment = left.segments?.find((segment) => (
        segment.element && segment.end > left.sourceStart && segment.start < left.sourceEnd
      ));
      const rightSegment = right.segments?.find((segment) => (
        segment.element && segment.end > right.sourceStart && segment.start < right.sourceEnd
      ));
      if (!leftSegment || !rightSegment || leftSegment.element !== rightSegment.element) return false;
      const leftOffset = leftSegment.mapBaseOffset
        + Math.max(leftSegment.start, left.sourceStart) - leftSegment.start;
      const rightOffset = rightSegment.mapBaseOffset
        + Math.max(rightSegment.start, right.sourceStart) - rightSegment.start;
      return leftOffset === rightOffset;
    };

    const firstLogicalJobAfter = (cursor, maximumLength) => {
      if (!cursor?.element) return null;

      // Pre-plan the next visible text only to choose the audio content.
      // No pixel offset or geometry is retained. At handoff the live DOM is
      // planned again, and this audio is reused only if the logical job matches.
      const plan = nextSpeechViewport(cursor);
      if (!plan) return null;
      const job = buildViewportSpeechJobs(
        plan.entries,
        speechMinimumLength,
        maximumLength
      )[0] || null;
      if (job) job.followText = false;
      return job;
    };

    while (entries.length > 0) {
      const maximumLength = speechMaximumLength;
      const jobs = viewportReading
        ? buildViewportSpeechJobs(entries, speechMinimumLength, maximumLength)
        : buildSpeechJobs(entries);
      if (jobs.length === 0) break;
      if (viewportReading) jobs.forEach((job) => { job.followText = false; });

      const canReuseQueued = queuedLogicalPreparation
        && jobStartsAtSameLogicalText(queuedLogicalPreparation.job, jobs[0]);
      settingsSpeechStatus.textContent = canReuseQueued
        ? "Next text is ready."
        : firstBatch
          ? "Generating first chunk…"
          : "Generating newly visible text…";
      firstBatch = false;

      let prepared;
      if (canReuseQueued) {
        const settled = await queuedLogicalPreparation.preparation;
        queuedLogicalPreparation = null;
        if (settled.error) throw settled.error;
        prepared = settled.value;
      } else {
        queuedLogicalPreparation = null;
        prepared = await prepareJob(jobs[0]);
      }

      for (let index = 0; index < jobs.length; index += 1) {
        if (generation !== speechGeneration) return;
        const currentJob = jobs[index];
        const nextPreparation = index + 1 < jobs.length
          ? settlePreparation(jobs[index + 1])
          : null;

        // Prefetch only the next logical chunk. Never retain future pixel offsets
        // or viewport geometry across playback/reflow.
        let futureLogicalPreparation = null;
        if (viewportReading && !nextPreparation) {
          const futureCursor = speechCursorFromJob(currentJob) || viewportCursor;
          const futureJob = firstLogicalJobAfter(
            futureCursor,
            maximumLength
          );
          if (futureJob) {
            futureLogicalPreparation = {
              job: futureJob,
              preparation: settlePreparation(futureJob)
            };
          }
        }

        const voiceName = prepared.voice?.replace(/\.onnx$/i, "") || "Piper";
        speechVoice.textContent = formatSpeechVoice(prepared);
        speechVoice.hidden = false;
        setSpeechActiveJob(currentJob);
        const backgroundGeneration = nextPreparation || futureLogicalPreparation?.preparation;
        settingsSpeechStatus.textContent = backgroundGeneration
          ? `Playing with ${voiceName}; generating next…`
          : `Playing with ${voiceName}…`;
        syncSpeechControls();
        updateMediaSession(true);

        const visible = await ensureSpeechJobVisible(currentJob);
        if (!visible && pageIsVisible()) {
          throw new Error("The next spoken text could not be brought into view.");
        }
        await playPreparedAudio(prepared);
        speechIsPaused = false;
        syncSpeechControls();
        updateMediaSession(true);
        if (generation !== speechGeneration) return;

        if (viewportReading) {
          viewportCursor = speechCursorFromJob(currentJob) || viewportCursor;
          if (index < jobs.length - 1) {
            await scrollDownAfterSpeechJob(currentJob);
          }
          if (generation !== speechGeneration) return;
        }

        if (nextPreparation) {
          const settled = await nextPreparation;
          if (settled.error) throw settled.error;
          prepared = settled.value;
        } else if (futureLogicalPreparation) {
          queuedLogicalPreparation = futureLogicalPreparation;
        }
      }

      if (!viewportReading || !viewportCursor) break;
      // Recompute the next viewport from the current DOM after playback.
      const plan = nextSpeechViewport(viewportCursor);
      if (!plan) break;
      await scrollBySpeechOffset(plan.offset);
      entries = plan.entries;
    }

    if (generation !== speechGeneration) return;
    speechIsActive = false;
    speechIsPaused = false;
    clearSpeechIndicators();
    releaseSpeechAudio();
    cancelSpeechPreloads();
    clearSpeechSelection();
    syncSpeechControls();
    setPlaybackAudioSession(false);
    updateMediaSession(false);
    settingsSpeechStatus.textContent = "Finished.";
  } catch (error) {
    if (generation !== speechGeneration) return;
    speechIsActive = false;
    speechIsPaused = false;
    clearSpeechIndicators();
    releaseSpeechAudio();
    cancelSpeechPreloads();
    clearSpeechSelection();
    syncSpeechControls();
    setPlaybackAudioSession(false);
    updateMediaSession(false);
    const message = error?.message || "Local Piper could not read this text.";
    settingsSpeechStatus.textContent = message;
    showStatus(`PIPER ERROR · ${message}`, 3200);
  }
};

const validateEpubBytes = async (bytes) => {
  if (typeof window.JSZip !== "function") return {};
  let archive;
  try {
    archive = await withTimeout(
      window.JSZip.loadAsync(bytes),
      EPUB_OPEN_TIMEOUT_MS,
      "EPUB archive validation timed out"
    );
  } catch (error) {
    throw new Error(`Invalid or damaged EPUB archive: ${error.message}`);
  }
  const container = archive.file("META-INF/container.xml");
  if (!container) throw new Error("Invalid EPUB: META-INF/container.xml is missing");
  const containerXml = await withTimeout(
    container.async("string"),
    EPUB_OPEN_TIMEOUT_MS,
    "EPUB package validation timed out"
  );
  const packagePath = decodeXmlText(
    containerXml.match(/<rootfile\b[^>]*\bfull-path\s*=\s*["']([^"']+)["']/i)?.[1]
  );
  if (!packagePath) {
    throw new Error("Invalid EPUB: package document is missing");
  }
  const packageEntry = archive.file(packagePath);
  if (!packageEntry) throw new Error("Invalid EPUB: package document is missing");
  const packageXml = await withTimeout(
    packageEntry.async("string"),
    EPUB_OPEN_TIMEOUT_MS,
    "EPUB package metadata timed out"
  );
  const packageMetadata = extractOpfBookMetadata(packageXml);
  const coverImagePromise = coverImageFromArchive(archive, packagePath, packageXml);
  if (!packageMetadata.publicationYear) {
    packageMetadata.publicationYear = await publicationYearFromArchive(
      archive,
      packagePath,
      packageXml
    );
  }
  return { ...packageMetadata, coverImagePromise };
};

const openBook = async (file) => {
  if (!file?.name?.toLowerCase().endsWith(".epub")) {
    showStatus("Please drop an EPUB file.");
    return;
  }
  if (isBookLoading) return;

  const generation = ++loadGeneration;
  let replacedCurrentBook = false;
  savePositionNow();
  setLibraryManageMode(false);
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
    const packageMetadata = await validateEpubBytes(bytes);
    if (generation !== loadGeneration) return;

    destroyCurrentBook();
    replacedCurrentBook = true;
    activeBookKey = hash;
    applyStoredBookSettings(hash);
    const savedPosition = loadPosition(hash);

    book = ePub(bytes);
    await withTimeout(
      Promise.all([book.opened, book.ready]),
      EPUB_OPEN_TIMEOUT_MS,
      "EPUB opening timed out"
    );
    if (generation !== loadGeneration) return;
    const coverThumbnailPromise = createCoverThumbnail(
      book,
      packageMetadata.coverImagePromise
    );

    const sections = [];
    book.spine.each((section) => {
      sections.push(section);
    });
    if (sections.length === 0) throw new Error("EPUB contains no readable sections");

    setReadingMode(true);
    for (let index = 0; index < sections.length; index += 1) {
      if (generation !== loadGeneration) return;
      showStatus(`LOADING ${index + 1} / ${sections.length}`);
      await withTimeout(
        appendChapter(sections[index], index),
        EPUB_OPEN_TIMEOUT_MS,
        `EPUB section ${index + 1} could not be loaded`
      );
    }

    if (generation !== loadGeneration) return;
    indexBookCharacterMetrics();
    await restorePosition(savedPosition);
    captureStableResizeAnchor();
    showStatus(
      `NATIVE SCROLL · ${sections.length} SECTIONS · HOME · PAGE UP / PAGE DOWN`,
      2800
    );

    const [metadata, thumbnail] = await withTimeout(
      Promise.all([book.loaded.metadata, coverThumbnailPromise]),
      EPUB_OPEN_TIMEOUT_MS,
      "EPUB metadata could not be loaded"
    );
    const epubMetadata = extractEpubBookMetadata(metadata, packageMetadata);
    const lastBookInfo = {
      hash,
      fileName: file.name,
      ...epubMetadata,
      characterCount: activeBookCharacterCount,
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
    scheduleServerStateSync(hash);
    return true;
  } catch (error) {
    console.error(error);
    if (replacedCurrentBook) {
      destroyCurrentBook();
      activeBookKey = null;
      activeBookTitle = "";
      replaceHomeHistory();
      showHomeView();
    }
    showStatus(`EPUB ERROR · ${error?.message || "This book could not be opened"}`, 6000);
    return false;
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

const openLibraryBook = async (record) => {
  if (isBookLoading || serverLibraryBusy) return;
  const serverRecord = serverRecordFor(record);
  const cached = cachedRecordFor(record);
  if (!serverRecord && !serverBookHashes.has(record?.hash)) {
    reopenCachedBook(record);
    return;
  }

  serverLibraryBusy = true;
  renderRecentBooks();
  showStatus(`LOADING FROM SERVER · ${record.title || record.fileName}`);
  let bytes = cached?.bytes || null;
  try {
    try {
      const statePayload = await serverRequest(
        `/api/library/books/${record.hash}/state`
      );
      mergeServerBookState(record.hash, statePayload.state);
    } catch (error) {
      if (!bytes) throw error;
      console.warn("Server state was unavailable; opening the device copy.", error);
    }
    if (!bytes) {
      bytes = await serverRequest(
        `/api/library/books/${record.hash}/epub`,
        { expectBinary: true },
        SERVER_LIBRARY_UPLOAD_TIMEOUT_MS
      );
    }
  } catch (error) {
    console.error(error);
    showStatus(`SERVER LIBRARY ERROR · ${error.message}`, 5200);
    return;
  } finally {
    serverLibraryBusy = false;
    renderRecentBooks();
  }

  const opened = await openBook({
    name: record.fileName || serverRecord?.fileName || `${record.hash.slice(0, 12)}.epub`,
    arrayBuffer: async () => bytes.slice(0)
  });
  if (opened) scheduleServerStateSync(record.hash, true);
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

  void openBook({
    name: cached.fileName,
    arrayBuffer: async () => cached.bytes.slice(0)
  });
};

const reopenLastBook = () => {
  if (isBookLoading) return;
  const firstBook = displayedLibraryBooks()[0];
  if (!lastBookCanReopen || !firstBook) {
    showStatus("LAST BOOK IS NOT CACHED · DROP IT AGAIN", 1800);
    return;
  }
  void openLibraryBook(firstBook);
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

  if (
    noCommandModifier && !event.shiftKey && key === "escape"
    && !settingsPaletteOptions.hidden
  ) {
    event.preventDefault();
    setPalettePickerOpen(false);
    settingsPaletteToggle.focus?.();
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
startExportLibrary.addEventListener("click", () => void exportLibrary());
startImportLibrary.addEventListener("click", () => libraryImportInput.click());
startManageLibrary.addEventListener("click", () => setLibraryManageMode(true));
startCancelManage.addEventListener("click", () => setLibraryManageMode(false));
startStoreServer.addEventListener("click", () => void storeSelectedBooksOnServer());
startRemoveLocal.addEventListener("click", () => void removeSelectedClientBooks());
startRemoveServer.addEventListener("click", () => void removeSelectedServerBooks());
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
settingsSpeechSpeed.addEventListener("input", (event) => {
  applySpeechSpeed(Number(event.target.value));
});
settingsSpeechSpeed.addEventListener("change", (event) => {
  applySpeechSpeed(Number(event.target.value), true);
});
settingsSpeechSpeedDown.addEventListener("click", () => {
  applySpeechSpeed(speechSpeedPercent - 1, true);
});
settingsSpeechSpeedUp.addEventListener("click", () => {
  applySpeechSpeed(speechSpeedPercent + 1, true);
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
settingsPaletteToggle.addEventListener("click", () => {
  setPalettePickerOpen(settingsPaletteOptions.hidden);
});
fullscreenToggle.addEventListener("click", () => void toggleFullscreen());
settingsHome.addEventListener("click", returnToHomeScreen);
settingsResetBook.addEventListener("click", resetCurrentBookSettings);

window.addEventListener("click", (event) => {
  if (
    !settingsPaletteOptions.hidden
    && !event.target?.closest?.("#settings-palette-picker")
  ) {
    setPalettePickerOpen(false);
  }
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
  rememberVisibleScrollPosition();
  schedulePositionSave();
  updateReadingProgress();
  scheduleStableResizeAnchorCapture();
}, { passive: true });
window.addEventListener("resize", handleViewportResize, { passive: true });
window.visualViewport?.addEventListener?.("resize", handleViewportResize, { passive: true });
window.addEventListener("popstate", (event) => {
  if (event.state?.app !== HISTORY_APP) return;
  if (event.state.view === "reader") showReaderView();
  else showHomeView();
});
document.addEventListener?.("fullscreenchange", syncFullscreenToggle);
document.addEventListener?.("webkitfullscreenchange", syncFullscreenToggle);
const flushAllPendingServerState = () => {
  const hashes = new Set([...serverStateSyncTimers.keys(), activeBookKey].filter(Boolean));
  hashes.forEach((hash) => flushServerBookState(hash));
};

document.addEventListener?.("visibilitychange", () => {
  if (!pageIsVisible()) {
    savePositionNow();
    flushAllPendingServerState();
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
window.addEventListener("pagehide", () => {
  savePositionNow();
  flushAllPendingServerState();
});
window.addEventListener("beforeunload", () => {
  savePositionNow();
  flushAllPendingServerState();
});
syncSpeechControls();
void probePiperBridge();
