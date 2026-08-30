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
  fontIndex = (nextIndex + FONTS.length) % FONTS.length;
  const font = FONTS[fontIndex];
  document.documentElement.dataset.font = font.id;
  localStorage.setItem(FONT_KEY, font.id);
  syncSettingsControls();

  if (announce) {
    showStatus(`FONT ${fontIndex + 1}/${FONTS.length} · ${font.name}`, 900);
  }
};

const applyTracking = (nextTracking, announce = true) => {
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

  if (announce) {
    const sign = trackingEm > 0 ? "+" : "";
    showStatus(`LETTER SPACING · ${sign}${trackingEm.toFixed(2)}em`, 900);
  }
};

const applyWidth = (nextWidth, announce = true) => {
  widthCh = Math.round(Math.max(MIN_WIDTH_CH, Math.min(MAX_WIDTH_CH, nextWidth)));
  document.documentElement.style.setProperty("--reader-width", `${widthCh}ch`);
  localStorage.setItem(WIDTH_KEY, String(widthCh));
  syncSettingsControls();

  if (announce) {
    showStatus(`TEXT WIDTH · APPROX. ${widthCh} CHARACTERS`, 900);
  }
};

const applyFontSize = (nextSize, announce = true) => {
  fontSizePx = Math.round(
    Math.max(MIN_FONT_SIZE_PX, Math.min(MAX_FONT_SIZE_PX, nextSize))
  );
  document.documentElement.style.setProperty("--reader-font-size", `${fontSizePx}px`);
  localStorage.setItem(FONT_SIZE_KEY, String(fontSizePx));
  syncSettingsControls();

  if (announce) showStatus(`FONT SIZE · ${fontSizePx}px`, 900);
};

const applyLineHeight = (nextLineHeight, announce = true) => {
  lineHeight = Math.round(
    Math.max(MIN_LINE_HEIGHT, Math.min(MAX_LINE_HEIGHT, nextLineHeight)) * 100
  ) / 100;
  document.documentElement.style.setProperty(
    "--reader-line-height",
    lineHeight.toFixed(2)
  );
  localStorage.setItem(LINE_HEIGHT_KEY, String(lineHeight));
  syncSettingsControls();

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

  if (book) {
    book.destroy();
    book = null;
  }

  viewer.replaceChildren();
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
window.addEventListener("blur", () => stopRightDrag());
window.addEventListener("beforeunload", savePositionNow);
