"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const makeElement = () => {
  const listeners = new Map();
  const classes = new Set();
  return {
    hidden: false,
    textContent: "",
    value: "",
    src: "",
    muted: false,
    paused: true,
    preservesPitch: false,
    files: null,
    disabled: false,
    className: "",
    style: {
      setProperty(name, value) {
        this[name] = value;
      }
    },
    dataset: {},
    attributes: {},
    children: [],
    listeners,
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
    capturedPointer: null,
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
      if (name === "src") this.src = "";
    },
    querySelectorAll() {
      return [];
    },
    scrollIntoView(options) {
      this.lastScrollIntoView = options;
    },
    click() {
      this.clickCount = (this.clickCount || 0) + 1;
    },
    load() {},
    canPlayType(type) {
      return type.includes("opus") ? "probably" : "";
    },
    pause() {
      this.paused = true;
    },
    play() {
      this.paused = false;
      if (this.autoEnd) setTimeout(() => this.onended?.(), 0);
      return Promise.resolve();
    },
    setPointerCapture(pointerId) {
      this.capturedPointer = pointerId;
    },
    releasePointerCapture(pointerId) {
      if (this.capturedPointer === pointerId) this.capturedPointer = null;
    }
  };
};

const elements = {
  "#drop-zone": makeElement(),
  "#reader": makeElement(),
  "#viewer": makeElement(),
  "#drag-cover": makeElement(),
  "#status": makeElement(),
  "#file-input": makeElement(),
  "#recent-books": makeElement(),
  "#recent-book-list": makeElement(),
  "#drop-picker": makeElement(),
  "#start-open": makeElement(),
  "#start-reopen": makeElement(),
  "#start-export-library": makeElement(),
  "#start-import-library": makeElement(),
  "#start-manage-library": makeElement(),
  "#library-manage-actions": makeElement(),
  "#start-store-server": makeElement(),
  "#start-remove-local": makeElement(),
  "#start-remove-server": makeElement(),
  "#start-cancel-manage": makeElement(),
  "#library-import-input": makeElement(),
  "#settings-menu": makeElement(),
  "#settings-toggle": makeElement(),
  "#fullscreen-toggle": makeElement(),
  "#settings-panel": makeElement(),
  "#settings-palette": makeElement(),
  "#settings-contrast": makeElement(),
  "#settings-contrast-value": makeElement(),
  "#settings-contrast-down": makeElement(),
  "#settings-contrast-up": makeElement(),
  "#settings-font": makeElement(),
  "#settings-font-size": makeElement(),
  "#settings-font-size-value": makeElement(),
  "#settings-font-size-down": makeElement(),
  "#settings-font-size-up": makeElement(),
  "#settings-line-height": makeElement(),
  "#settings-line-height-value": makeElement(),
  "#settings-line-height-down": makeElement(),
  "#settings-line-height-up": makeElement(),
  "#settings-tracking-value": makeElement(),
  "#settings-tracking-down": makeElement(),
  "#settings-tracking-reset": makeElement(),
  "#settings-tracking-up": makeElement(),
  "#settings-width": makeElement(),
  "#settings-width-value": makeElement(),
  "#settings-width-down": makeElement(),
  "#settings-width-up": makeElement(),
  "#settings-speech-voice": makeElement(),
  "#settings-speech-speaker-row": makeElement(),
  "#settings-speech-speaker": makeElement(),
  "#settings-speech-max": makeElement(),
  "#settings-speech-max-value": makeElement(),
  "#settings-speech-max-down": makeElement(),
  "#settings-speech-max-up": makeElement(),
  "#settings-speech-position": makeElement(),
  "#settings-speech-position-value": makeElement(),
  "#settings-speech-position-down": makeElement(),
  "#settings-speech-position-up": makeElement(),
  "#settings-speech-speed": makeElement(),
  "#settings-speech-speed-value": makeElement(),
  "#settings-speech-speed-down": makeElement(),
  "#settings-speech-speed-up": makeElement(),
  "#settings-speech-start": makeElement(),
  "#settings-speech-pause": makeElement(),
  "#settings-speech-stop": makeElement(),
  "#settings-speech-status": makeElement(),
  "#settings-home": makeElement(),
  "#settings-open": makeElement(),
  "#settings-reset-book": makeElement(),
  "#speech-voice": makeElement(),
  "#speech-controls": makeElement(),
  "#speech-overlay-pause": makeElement(),
  "#speech-overlay-stop": makeElement(),
  "#speech-overlay-home": makeElement(),
  "#speech-audio": makeElement(),
  "#reading-progress": makeElement(),
  "#speech-marker": makeElement()
};

elements["#reader"].hidden = true;
elements["#drag-cover"].hidden = true;
elements["#status"].hidden = true;
elements["#recent-books"].hidden = true;
elements["#settings-menu"].hidden = true;
elements["#settings-panel"].hidden = true;
elements["#fullscreen-toggle"].hidden = true;
elements["#settings-speech-speaker-row"].hidden = true;
elements["#library-manage-actions"].hidden = true;
elements["#start-store-server"].hidden = true;
elements["#start-remove-server"].hidden = true;
elements["#reading-progress"].hidden = true;
elements["#speech-voice"].hidden = true;
elements["#speech-controls"].hidden = true;
elements["#speech-marker"].hidden = true;

const windowListeners = new Map();
const documentListeners = new Map();
const historyEntries = [null];
let historyIndex = 0;
const stored = new Map();
stored.set("smooth-reader:last-book", JSON.stringify({
  fileName: "previous.epub",
  title: "Previous Book"
}));
stored.set("smooth-reader:speech-position", "22");
const indexedRecords = new Map([
  ["last-opened", {
    fileName: "previous.epub",
    title: "Previous Book",
    thumbnail: "data:image/jpeg;base64,VEhVTUI=",
    bytes: new Uint8Array([9, 8, 7]).buffer
  }]
]);
let databaseCreated = false;
const scrollCalls = [];
const scrollByCalls = [];
const renderedSections = [];
let unloadedSections = 0;
let anchorRectCalls = 0;
const selectionRanges = [];
const createdRanges = [];
const fetchCalls = [];
const confirmPrompts = [];
const createdObjectUrls = [];
const revokedObjectUrls = [];
let speechRectLeft = 120;
let speechBlockLeft = 80;
let speechBlockLeftTwo = 80;
const anchorTextNode = {
  nodeType: 3,
  textContent: "A stable reading anchor",
  isConnected: true
};

const makeSection = (index) => ({
  linear: "yes",
  href: `chapter-${index}.xhtml`,
  async render() {
    renderedSections.push(index);
    return `<html><body><p>Chapter ${index}</p></body></html>`;
  },
  unload() {
    unloadedSections += 1;
  }
});

const indexedDB = {
  open() {
    const request = {};
    setTimeout(() => {
      const database = {
        objectStoreNames: {
          contains() {
            return databaseCreated;
          }
        },
        createObjectStore() {
          databaseCreated = true;
        },
        transaction() {
          const transaction = {
            error: null,
            objectStore() {
              return {
                get(key) {
                  const getRequest = {};
                  setTimeout(() => {
                    getRequest.result = indexedRecords.get(key);
                    getRequest.onsuccess?.();
                  }, 0);
                  return getRequest;
                },
                put(value, key) {
                  indexedRecords.set(key, value);
                  setTimeout(() => transaction.oncomplete?.(), 0);
                },
                delete(key) {
                  indexedRecords.delete(key);
                }
              };
            }
          };
          return transaction;
        },
        close() {}
      };
      request.result = database;
      if (!databaseCreated) request.onupgradeneeded?.();
      request.onsuccess?.();
    }, 0);
    return request;
  }
};

const context = vm.createContext({
  console,
  Uint8Array,
  JSON,
  Date,
  DOMParser: class {
    parseFromString(markup) {
      return {
        body: {
          childNodes: [{ markup }]
        },
        querySelectorAll() {
          return [];
        }
      };
    }
  },
  setTimeout,
  clearTimeout,
  Blob,
  AbortController,
  URL: {
    createObjectURL() {
      const value = `blob:smooth-reader-${createdObjectUrls.length + 1}`;
      createdObjectUrls.push(value);
      return value;
    },
    revokeObjectURL(value) {
      revokedObjectUrls.push(value);
    }
  },
  crypto: {
    subtle: {
      async digest(_algorithm, bytes) {
        const digest = new Uint8Array(32);
        digest[0] = new Uint8Array(bytes)[0] || 0;
        return digest.buffer;
      }
    }
  },
  localStorage: {
    get length() {
      return stored.size;
    },
    key(index) {
      return [...stored.keys()][index] ?? null;
    },
    getItem(key) {
      return stored.get(key) ?? null;
    },
    setItem(key, value) {
      stored.set(key, value);
    },
    removeItem(key) {
      stored.delete(key);
    }
  },
  document: {
    title: "Smooth Reader",
    hidden: false,
    visibilityState: "visible",
    fullscreenEnabled: true,
    fullscreenElement: null,
    async exitFullscreen() {
      this.fullscreenElement = null;
      documentListeners.get("fullscreenchange")?.();
    },
    fonts: { ready: Promise.resolve() },
    addEventListener(name, callback) {
      documentListeners.set(name, callback);
    },
    documentElement: {
      scrollHeight: 3000,
      dataset: { view: "home" },
      async requestFullscreen() {
        context.document.fullscreenElement = context.document.documentElement;
        documentListeners.get("fullscreenchange")?.();
      },
      style: {
        setProperty(name, value) {
          this[name] = value;
        }
      }
    },
    body: {
      classList: {
        add() {},
        remove() {}
      }
    },
    querySelector(selector) {
      return elements[selector];
    },
    createElement() {
      return makeElement();
    },
    importNode(node) {
      return { ...node };
    },
    caretPositionFromPoint() {
      if (elements["#reader"].hidden) return null;
      return { offsetNode: anchorTextNode, offset: 4 };
    },
    createTreeWalker(element) {
      const nodes = element.textNodes || [];
      let index = 0;
      return {
        nextNode() {
          const node = nodes[index] || null;
          index += 1;
          return node;
        }
      };
    },
    createRange() {
      const range = {
        setStart(node, offset) {
          this.startNode = node;
          this.startOffset = offset;
        },
        setEnd(node, offset) {
          this.endNode = node;
          this.endOffset = offset;
        },
        collapse() {},
        cloneRange() {
          return this;
        },
        getBoundingClientRect() {
          anchorRectCalls += 1;
          return { top: anchorRectCalls === 1 ? 200 : 260 };
        },
        getClientRects() {
          if (typeof this.startNode?.rectForOffsets === "function") {
            return this.startNode.rectForOffsets(this.startOffset, this.endOffset);
          }
          const top = this.startNode === speechNodeOne ? 650 : 520;
          return [{ left: speechRectLeft, top, bottom: top + 80, width: 240, height: 20 }];
        }
      };
      createdRanges.push(range);
      return range;
    }
  },
  window: {
    indexedDB,
    innerWidth: 1200,
    innerHeight: 800,
    scrollY: 0,
    confirm(message) {
      confirmPrompts.push(message);
      return true;
    },
    history: {
      state: null,
      scrollRestoration: "auto",
      replaceState(state) {
        historyEntries[historyIndex] = state;
        this.state = state;
      },
      pushState(state) {
        historyEntries.splice(historyIndex + 1);
        historyEntries.push(state);
        historyIndex += 1;
        this.state = state;
      },
      back() {
        if (historyIndex === 0) return;
        historyIndex -= 1;
        this.state = historyEntries[historyIndex];
        setTimeout(() => windowListeners.get("popstate")?.({ state: this.state }), 0);
      },
      forward() {
        if (historyIndex >= historyEntries.length - 1) return;
        historyIndex += 1;
        this.state = historyEntries[historyIndex];
        setTimeout(() => windowListeners.get("popstate")?.({ state: this.state }), 0);
      }
    },
    setTimeout,
    clearTimeout,
    fetch(path) {
      fetchCalls.push(path);
      if (path === "/api/library/books") {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({ ok: false, error: "Not found" })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        blob: async () => new Blob(["test-opus"], { type: "audio/ogg" }),
        json: async () => path === "/api/piper/status"
          ? {
            ok: true,
            available: true,
            voices: ["voice-one.onnx", "voice-two.onnx", "voice-large.onnx"],
            voiceDetails: [
              {
                id: "voice-one.onnx",
                speakerCount: 3,
                speakerNames: { "0": "ALPHA", "2": "GAMMA" }
              },
              { id: "voice-two.onnx", speakerCount: 1, speakerNames: {} },
              { id: "voice-large.onnx", speakerCount: 901, speakerNames: {} }
            ]
          }
          : { ok: true }
      });
    },
    requestAnimationFrame(callback) {
      return setTimeout(() => callback(Date.now()), 0);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    },
    scrollTo(first, second) {
      const y = typeof first === "object" ? first.top : second;
      this.scrollY = y;
      scrollCalls.push(y);
    },
    scrollBy(options) {
      this.scrollY += options.top;
      scrollByCalls.push(options);
    },
    getSelection() {
      return {
        rangeCount: selectionRanges.length,
        toString() {
          return "";
        },
        getRangeAt(index) {
          return selectionRanges[index];
        },
        removeAllRanges() {
          selectionRanges.length = 0;
        },
        addRange(range) {
          selectionRanges.push(range);
        }
      };
    },
    addEventListener(name, callback) {
      windowListeners.set(name, callback);
    }
  },
  ePub() {
    const sections = [makeSection(1), makeSection(2)];
    return {
      opened: Promise.resolve(),
      ready: Promise.resolve(),
      loaded: {
        metadata: Promise.resolve({ title: "Test Book" })
      },
      spine: {
        each(callback) {
          sections.forEach(callback);
        }
      },
      load() {},
      destroy() {}
    };
  }
});

const rendererPath = path.join(__dirname, "..", "renderer-v36.js");
const rendererSource = fs.readFileSync(rendererPath, "utf8");
vm.runInContext(rendererSource, context, {
  filename: rendererPath
});

const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(__dirname, "..", "styles-v36-mobile7.css"), "utf8");
const readmeSource = fs.readFileSync(path.join(__dirname, "..", "README.md"), "utf8");
const aboutTechSource = fs.readFileSync(path.join(__dirname, "..", "ABOUTTECH.md"), "utf8");
const fontsDirectory = path.join(__dirname, "..", "vendor", "fonts");
const fontsSource = fs.readFileSync(path.join(fontsDirectory, "reader-fonts.css"), "utf8");
assert.match(indexSource, /styles-v36-mobile7\.css/);
assert.match(indexSource, /renderer-v36\.js/);
assert.match(readmeSource, /\[ABOUTTECH\.md\]\(ABOUTTECH\.md\)/);
assert.match(aboutTechSource, /## Browser-side persistence/);
assert.match(aboutTechSource, /## Piper bridge: server side/);
assert.match(indexSource, /id="recent-books"/);
assert.match(indexSource, /id="start-hotkeys"/);
assert.match(indexSource, /id="start-export-library"[^>]*>EXPORT LIBRARY</);
assert.match(indexSource, /id="start-import-library"[^>]*>IMPORT LIBRARY</);
assert.match(indexSource, /id="start-manage-library"[^>]*>MANAGE LIBRARY</);
assert.match(indexSource, /id="library-manage-actions"[^>]*hidden/);
assert.match(indexSource, /id="start-store-server"[^>]*>STORE ON SERVER</);
assert.match(indexSource, /id="start-remove-local"[^>]*>REMOVE FROM THIS DEVICE</);
assert.match(indexSource, /id="start-remove-server"[^>]*>REMOVE FROM SERVER</);
assert.match(indexSource, /id="start-cancel-manage"[^>]*>CANCEL</);
assert.match(indexSource, /id="library-import-input"[^>]*accept="\.zip,application\/zip"/);
assert.match(indexSource, /id="library-actions"/);
assert.ok(indexSource.indexOf('id="library-actions"') < indexSource.indexOf('id="start-hotkeys"'));
assert.doesNotMatch(indexSource, /id="settings-(?:export|import)-library"/);
assert.match(indexSource, /Alt\+Shift\+1…9\/0/);
assert.match(indexSource, /Middle-click/);
assert.match(indexSource, /Right-drag/);
assert.match(indexSource, /Alt\+Shift\+M/);
assert.match(indexSource, /id="settings-menu"/);
assert.match(indexSource, /id="settings-width"/);
assert.match(indexSource, /id="reading-progress"/);
assert.match(indexSource, /id="progress-stack"/);
assert.match(indexSource, /id="speech-voice"/);
assert.doesNotMatch(indexSource, /id="speech-progress"/);
assert.match(indexSource, /id="speech-controls"/);
assert.match(indexSource, /id="speech-overlay-pause"/);
assert.match(indexSource, /id="speech-overlay-stop"/);
assert.match(indexSource, /id="speech-overlay-home"/);
assert.match(indexSource, /id="speech-audio"[^>]*preload="auto"/);
assert.match(indexSource, /id="settings-home"[^>]*>HOME</);
assert.doesNotMatch(indexSource, /id="settings-reopen"/);
assert.doesNotMatch(indexSource, /id="settings-end"/);
assert.doesNotMatch(indexSource, /id="settings-page-(?:up|down)"/);
assert.match(indexSource, /id="settings-font-size"/);
assert.match(indexSource, /id="settings-contrast"[^>]*min="-30"[^>]*max="30"/);
assert.match(indexSource, /id="settings-line-height"/);
assert.match(indexSource, /id="settings-speech-start"/);
assert.match(indexSource, /id="settings-speech-speaker-row"[^>]*hidden/);
assert.match(indexSource, /id="settings-speech-speaker"[^>]*>\s*<option value="">RANDOM ID<\/option>/);
assert.doesNotMatch(indexSource, /id="settings-speech-min"/);
assert.match(indexSource, /id="settings-speech-max"/);
assert.match(indexSource, /Spoken text center offset/);
assert.match(indexSource, /id="settings-speech-position"[^>]*min="-25"[^>]*max="25"/);
assert.match(indexSource, /id="settings-speech-speed"[^>]*min="-33"[^>]*max="33"/);
assert.match(indexSource, /id="settings-speech-pause"/);
assert.match(indexSource, /id="settings-speech-stop"/);
assert.match(indexSource, /id="settings-toggle"[\s\S]*aria-label="Open reader settings"/);
assert.match(indexSource, /id="fullscreen-toggle"[\s\S]*aria-label="Enter fullscreen"/);
assert.match(indexSource, /id="settings-font-size"[^>]*max="80"[^>]*step="2"/);
assert.match(indexSource, /id="settings-width"[^>]*min="8"[^>]*max="100"[^>]*step="2"/);
assert.match(indexSource, /id="settings-font-size-down"/);
assert.match(indexSource, /id="settings-font-size-up"/);
for (const range of [
  "settings-contrast", "settings-font-size", "settings-line-height",
  "settings-width", "settings-speech-max",
  "settings-speech-position", "settings-speech-speed"
]) {
  assert.match(indexSource, new RegExp(`id="${range}-down"`), `${range} minus`);
  assert.match(indexSource, new RegExp(`id="${range}-up"`), `${range} plus`);
}
assert.doesNotMatch(indexSource, /id="start-(?:contrast|font-size|line-height|width|reset-all)"/);
assert.match(indexSource, /id="settings-reset-book"[^>]*>RESET THIS BOOK</);
assert.doesNotMatch(indexSource, /id="settings-reset-global"|RESET GLOBAL SETTINGS/);
assert.doesNotMatch(indexSource, /id="start-settings-scope"/);
assert.doesNotMatch(indexSource, /<strong>GLOBAL<\/strong>/);
assert.match(indexSource, /<html lang="en" data-view="home">/);
assert.match(indexSource, /styles-v36-mobile7\.css/);
assert.match(indexSource, /styles-v36-mobile7\.css\?v=20260912-fullscreen2/);
assert.match(indexSource, /renderer-v36\.js\?v=20260912-fullscreen2/);
assert.equal(context.window.history.scrollRestoration, "manual");
assert.equal(vm.runInContext("MAX_RECENT_BOOKS", context), 12);
assert.equal(vm.runInContext("COVER_THUMBNAIL_MAX_WIDTH", context), 600);
assert.equal(vm.runInContext("COVER_THUMBNAIL_MAX_HEIGHT", context), 900);
assert.equal(vm.runInContext("COVER_THUMBNAIL_QUALITY", context), 0.86);
assert.match(rendererSource, /thumbnailVersion:\s*COVER_THUMBNAIL_VERSION/);
assert.match(rendererSource, /imageSmoothingQuality = "high"/);
assert.match(indexSource, /vendor\/fonts\/reader-fonts\.css\?v=20260903-fonts1/);
assert.match(rendererSource, /\/api\/piper\/prepare/);
assert.match(rendererSource, /sessionId:\s*speechSessionId/);
assert.match(rendererSource, /audioFormat:\s*speechAudioFormat/);
assert.match(rendererSource, /\/api\/piper\/stop[\s\S]*JSON\.stringify\(\{ sessionId: speechSessionId \}\)/);
assert.match(rendererSource, /BOOK_SETTINGS_PREFIX/);
assert.match(rendererSource, /LIBRARY_BACKUP_FORMAT = "smooth-reader-library"/);
assert.match(rendererSource, /const exportLibrary = async/);
assert.match(rendererSource, /const importLibrary = async/);
assert.match(rendererSource, /\/api\/library\/books/);
assert.match(rendererSource, /const storeSelectedBooksOnServer = async/);
assert.match(rendererSource, /const removeSelectedServerBooks = async/);
assert.match(rendererSource, /const removeSelectedClientBooks = async/);
assert.match(rendererSource, /const EPUB_OPEN_TIMEOUT_MS = 30_000/);
assert.match(rendererSource, /const validateEpubBytes = async/);
assert.match(rendererSource, /captureTextPositionAnchor/);
assert.match(rendererSource, /restoreTextPositionAnchor/);
assert.match(rendererSource, /captureFirstFullyVisibleTextAnchor/);
assert.match(rendererSource, /placement: "first-visible-line"/);
assert.match(rendererSource, /FIRST_VISIBLE_LINE_TOP_PADDING_PX = 12/);
assert.doesNotMatch(rendererSource, /window\.innerHeight \* 0\.32/);
assert.match(rendererSource, /speechAudio\.playbackRate = 1 \+ speechSpeedPercent \/ 100/);
assert.match(rendererSource, /savePositionNow\(\);[\s\S]*storageSnapshot\(\)/);
assert.match(rendererSource, /key\.startsWith\(POSITION_PREFIX\)/);
assert.match(rendererSource, /positionSavedAt\(existing\) > positionSavedAt\(value\)/);
assert.equal(
  vm.runInContext("recentMetadataOnly({ hash: 'x', thumbnail: 'large', bytes: 'epub' }).thumbnail", context),
  undefined
);
assert.match(rendererSource, /window\.addEventListener\("popstate"/);
assert.match(rendererSource, /commitReaderHistory/);
assert.doesNotMatch(rendererSource, /\/api\/piper\/(?:play|pause|resume)/);
assert.match(rendererSource, /await speechAudio\.play\(\)/);
assert.match(rendererSource, /const preloadPreparedAudio = async/);
assert.match(rendererSource, /prepared\.prefetchedAudioUrl \|\| prepared\.audioUrl/);
assert.match(rendererSource, /cancelSpeechPreloads\(\)/);
assert.match(rendererSource, /const speechBlockElements = \(\) =>/);
assert.match(rendererSource, /const SPEECH_SCROLL_DURATION_MS = 10/);
assert.match(rendererSource, /await scrollDownAfterSpeechJob\(currentJob\)/);
assert.match(rendererSource, /const plan = nextSpeechViewport\(futureCursor\)/);
assert.match(rendererSource, /firstPreparation:\s*settlePreparation\(futureJobs\[0\]\)/);
assert.match(rendererSource, /await ensureSpeechJobVisible\(currentJob\)/);
assert.match(rendererSource, /document\.addEventListener\?\.\("visibilitychange"/);
assert.match(rendererSource, /const eased = 1 - \(\(1 - progress\) \*\* 3\)/);
assert.doesNotMatch(rendererSource, /await animateSpeechScrollBy/);
assert.match(rendererSource, /unlockSpeechAudio\(\);\s*const generation/);
assert.match(rendererSource, /nextPreparation/);
assert.doesNotMatch(rendererSource, /speechProgress|speechChunkNumber|CHUNK/);
assert.match(stylesSource, /#reading-progress\s*\{[^}]*font-size:\s*1\.50rem[^}]*font-weight:\s*400/s);
assert.match(rendererSource, /speechVoice\.textContent = formatSpeechVoice\(prepared\)/);
assert.match(rendererSource, /speaker:\s*requestedSpeaker/);
assert.match(rendererSource, /speaker:\s*speechSpeakerPreference/);
assert.equal(
  vm.runInContext("formatSpeechVoice({ voice: 'solo.onnx', speaker: 0, speakerCount: 1 })", context),
  "solo"
);
assert.equal(
  vm.runInContext("formatSpeechVoice({ voice: 'multi.onnx', speaker: 3, speakerCount: 8 })", context),
  "multi/3"
);
assert.doesNotMatch(rendererSource, /PIPER · PLAYING|PIPER · [0-9]/);
assert.equal((rendererSource.match(/showStatus\(`PIPER ERROR/g) || []).length, 2);
assert.match(rendererSource, /createSpeechRange/);
assert.match(rendererSource, /addEventListener\("resize", handleViewportResize/);
assert.match(rendererSource, /stableResizeAnchor \|\| captureLayoutAnchor\(\)/);
assert.match(rendererSource, /ResizeObserver\(scheduleSpeechMarkerRefresh\)/);
assert.match(rendererSource, /speechScrollOffsetForRects/);
assert.match(rendererSource, /speechTargetCenterY/);
assert.match(rendererSource, /SPEECH_VIEWPORT_MARGIN_PX = 16/);
assert.doesNotMatch(rendererSource, /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/);
assert.match(indexSource, /id="speech-marker"/);
assert.match(stylesSource, /#speech-marker/);
assert.doesNotMatch(indexSource, /fonts\.(?:googleapis|gstatic)\.com/);
assert.doesNotMatch(fontsSource, /https?:\/\//);
assert.equal((fontsSource.match(/@font-face/g) || []).length, 37);
for (const match of fontsSource.matchAll(/src: url\("([^"]+)"\)/g)) {
  assert.equal(fs.existsSync(path.join(fontsDirectory, match[1])), true, match[1]);
}
assert.match(fontsSource, /EnvyCodeRNerdFont-Regular-v3\.5\.1\.ttf/);
assert.match(stylesSource, /"Noto Serif"/);
assert.match(stylesSource, /"EB Garamond"/);
assert.match(stylesSource, /"EnvyCodeR Nerd Font"/);
assert.match(stylesSource, /--ui-font:\s*"EnvyCodeR Nerd Font"/);
assert.match(stylesSource, /#drop-zone[^{]*\{[^}]*font-family:\s*var\(--ui-font\)/s);
assert.match(stylesSource, /#settings-menu[^{]*\{[^}]*font-family:\s*var\(--ui-font\)/s);
assert.match(stylesSource, /#reading-progress,\s*#speech-voice[^{]*\{[^}]*font-family:\s*var\(--reader-font\)/s);
assert.match(stylesSource, /data-font="system-sans"[\s\S]*--reader-font:\s*system-ui, -apple-system, "Segoe UI", sans-serif/);
assert.match(stylesSource, /"Cascadia Mono"/);
assert.match(stylesSource, /@supports \(color: color-mix\(in srgb, white, black\)\)/);
assert.match(stylesSource, /--contrast-strength/);
assert.match(stylesSource, /--contrast-soften/);
assert.match(stylesSource, /:root\[data-view="home"\][^{]*\{[^}]*--background:\s*#2e3440[^}]*--contrast-strength:\s*0%\s*!important/s);
assert.match(stylesSource, /--range-button-size:\s*44px/);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*--range-button-size:\s*48px/);
assert.match(stylesSource, /overflow-x:\s*clip/);
assert.match(stylesSource, /\.book-section \*[^{]*\{[^}]*max-width:\s*100%\s*!important[^}]*overflow-wrap:\s*anywhere/s);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*font-size:\s*clamp\(14px, calc\(var\(--reader-font-size\) \* 0\.67\), 54px\)/s);
assert.match(stylesSource, /font-family:\s*var\(--reader-font\)/);
assert.match(stylesSource, /--reader-width:\s*44ch/);
assert.match(stylesSource, /--reader-font-size:\s*36px/);
assert.match(stylesSource, /#progress-stack[^{]*\{[^}]*safe-area-inset-right[^}]*safe-area-inset-bottom/s);
assert.match(stylesSource, /--reader-line-height:\s*1\.28/);
assert.match(stylesSource, /--reader-tracking:\s*0\.02em/);
assert.match(stylesSource, /#settings-menu[^{]*\{[^}]*right:/s);
assert.doesNotMatch(stylesSource, /#settings-menu[^{]*\{[^}]*left:\s*0\.8rem/s);
assert.match(stylesSource, /#speech-controls/);
assert.match(stylesSource, /#speech-controls[^{]*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*1fr/s);
assert.match(stylesSource, /#speech-controls button[^{]*\{[^}]*border:\s*1px solid transparent[^}]*background:\s*transparent[^}]*opacity:\s*0\.2/s);
assert.match(stylesSource, /#speech-controls button:is\(:hover, :focus-visible\)[^{]*\{[^}]*border-color:\s*var\(--display-line\)[^}]*background:\s*var\(--display-panel\)[^}]*opacity:\s*1/s);
assert.match(stylesSource, /#recent-book-list \.recent-book::before[^{]*\{[^}]*content:\s*"EPUB"/s);
assert.match(rendererSource, /const createCoverThumbnail = async/);
assert.match(rendererSource, /void probePiperBridge\(\)/);
assert.match(stylesSource, /safe-area-inset-bottom/);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*height:\s*100dvh/);
assert.match(stylesSource, /touch-action:\s*none/);
assert.match(stylesSource, /\(pointer:\s*coarse\)/);
assert.match(stylesSource, /#settings-toggle[^{]*\{[^}]*width:\s*44px[^}]*height:\s*44px[^}]*opacity:\s*0\.18/s);
assert.match(stylesSource, /#speech-controls button,\s*#fullscreen-toggle[^{]*\{[^}]*width:\s*42px[^}]*height:\s*42px[^}]*opacity:\s*0\.2/s);
assert.match(stylesSource, /#fullscreen-toggle[^{]*\{[^}]*pointer-events:\s*auto/s);
assert.match(stylesSource, /#fullscreen-toggle:is\(:hover, :focus-visible\)[^{]*\{[^}]*border-color:\s*var\(--display-line\)[^}]*background:\s*var\(--display-panel\)[^}]*opacity:\s*1/s);
assert.doesNotMatch(stylesSource, /#settings-toggle[^{]*\{[^}]*width:\s*52px/s);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*#start-hotkeys[^{]*\{[^}]*font-size:\s*clamp\(1rem/s);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*#settings-panel[^{]*\{[^}]*width:\s*min\(96vw, 28rem\)[^}]*font-size:\s*1rem/s);
assert.match(stylesSource, /#recent-book-list[^{]*\{[^}]*grid-template-columns:\s*repeat\(auto-fit/s);
assert.match(stylesSource, /#recent-book-list[^{]*\{[^}]*justify-content:\s*center/s);
assert.match(stylesSource, /#drop-picker,\s*#recent-books,\s*#start-hotkeys,\s*#library-actions,\s*#library-manage-actions[^{]*\{[^}]*justify-self:\s*center[^}]*margin-inline:\s*auto/s);
assert.ok(indexSource.indexOf('id="speech-controls"') < indexSource.indexOf('id="reading-progress"'));
assert.ok(indexSource.indexOf('id="fullscreen-toggle"') < indexSource.indexOf('id="speech-controls"'));
assert.ok(indexSource.indexOf('id="speech-overlay-pause"') < indexSource.indexOf('id="speech-overlay-stop"'));
assert.ok(indexSource.indexOf('id="speech-overlay-stop"') < indexSource.indexOf('id="speech-overlay-home"'));
assert.ok(indexSource.indexOf('id="reading-progress"') < indexSource.indexOf('id="speech-voice"'));
assert.match(stylesSource, /#drop-zone[^{]*\{[^}]*font-size:\s*clamp\(16px, 1\.2vw, 20px\)/s);
assert.match(stylesSource, /#drop-zone[^{]*\{[^}]*position:\s*relative[^}]*place-content:\s*start center[^}]*min-height:\s*100dvh[^}]*overflow:\s*visible/s);
assert.doesNotMatch(stylesSource, /#drop-zone[^{]*\{[^}]*position:\s*fixed/s);
assert.match(stylesSource, /font-size:\s*clamp\(0\.82rem, 0\.72em, 1rem\)/);
assert.doesNotMatch(stylesSource, /html,\s*body[^}]*overflow:\s*hidden/s);
assert.match(stylesSource, /overflow:\s*visible\s*!important/);
assert.match(stylesSource, /#333d4d/i);
for (const palette of [
  "charcoal", "geany", "midnight", "sepia", "forest",
  "paper", "nord", "solarized", "gruvbox", "plum",
  "flexoki-dark", "catppuccin-mocha", "hackerman", "lumon",
  "vantablack", "black-gold"
]) {
  assert.match(stylesSource, new RegExp(`data-palette="${palette}"`), palette);
}
assert.match(stylesSource, /data-palette="charcoal"[\s\S]*--background:\s*#121212/);
assert.match(stylesSource, /data-palette="nord"[\s\S]*--background:\s*#2e3440/);
assert.match(stylesSource, /#recent-books[^{]*\{[^}]*width:\s*min\(64rem/s);
assert.match(stylesSource, /#recent-book-list \.recent-book::before[^{]*\{[^}]*width:\s*100%/s);
assert.match(stylesSource, /#recent-book-list \.recent-book[^{]*\{[^}]*text-align:\s*left/s);
assert.match(stylesSource, /#recent-book-list\.is-managing \.recent-book\.is-selected/);
assert.match(stylesSource, /#library-manage-actions/);
assert.match(stylesSource, /\.recent-book\.is-server-stored::before/);

assert.equal(
  JSON.stringify(vm.runInContext("splitSpeechText('Dr. One. Mr. Two.', 1, 12)", context)),
  JSON.stringify(["Doctor One.", "Mister Two."])
);
const boundedSpeechLengths = JSON.parse(vm.runInContext(`JSON.stringify(
  splitSpeechText(
    Array.from({ length: 80 }, (_, index) => 'Sentence ' + index + ' has enough words for reliable Piper synthesis.').join(' '),
    350,
    550
  ).map((chunk) => chunk.length)
)`, context));
assert.ok(boundedSpeechLengths.length > 1);
assert.equal(boundedSpeechLengths.slice(0, -1).every((length) => length >= 350), true);
assert.equal(boundedSpeechLengths.at(-1) > 0, true);
assert.equal(Math.max(...boundedSpeechLengths) <= 550, true);
assert.equal(
  vm.runInContext(
    "splitSpeechText('One sentence. Another sentence! Is this the third? Final words', 20, 45).every((chunk) => /[.!?]$/.test(chunk))",
    context
  ),
  true
);
const wordLimitedSpeechLengths = JSON.parse(vm.runInContext(
  "JSON.stringify(splitSpeechText('ordinary '.repeat(300).trim(), 100, 180).map((chunk) => chunk.length))",
  context
));
assert.ok(wordLimitedSpeechLengths.length > 1);
assert.equal(wordLimitedSpeechLengths.every((length) => length <= 180), true);
const unbrokenSpeechChunks = JSON.parse(vm.runInContext(
  "JSON.stringify(splitSpeechText('x'.repeat(500), 100, 180))",
  context
));
assert.equal(unbrokenSpeechChunks.every((chunk) => chunk.length <= 180), true);
assert.equal(unbrokenSpeechChunks[0], "x".repeat(180));
const punctuationPriorityChunks = JSON.parse(vm.runInContext(
  "JSON.stringify(splitSpeechText('A fairly long clause, and another clause; then a final clause without a strong stop before the configured boundary ' + 'ordinary '.repeat(20), 40, 100))",
  context
));
assert.equal(punctuationPriorityChunks[0].endsWith(";"), true);
assert.equal(punctuationPriorityChunks.every((chunk) => chunk.length <= 100), true);

const makeViewportSpeechElement = (text, blockTop, blockBottom, rectForOffsets) => {
  const element = makeElement();
  const node = {
    nodeType: 3,
    nodeValue: text,
    parentElement: element,
    rectForOffsets
  };
  element.textContent = text;
  element.textNodes = [node];
  element.getBoundingClientRect = () => ({
    left: 100,
    right: 500,
    top: blockTop,
    bottom: blockBottom
  });
  return element;
};
const aboveViewportSpeechElement = makeViewportSpeechElement(
  "This text is above the screen.",
  -100,
  -20,
  () => []
);
const clippedViewportSpeechElement = makeViewportSpeechElement(
  "This line is only partly visible.",
  0,
  24,
  () => [{ left: 100, right: 300, top: 0, bottom: 20, width: 200, height: 20 }]
);
const partialViewportSpeechElement = makeViewportSpeechElement(
  "hidden visible words below",
  -40,
  840,
  (start) => {
    const top = start < 7 ? -30 : start < 21 ? 120 + start : 810;
    return [{ left: 100, right: 300, top, bottom: top + 20, width: 200, height: 20 }];
  }
);
const fullViewportSpeechElement = makeViewportSpeechElement(
  "Fully visible text.",
  300,
  350,
  () => []
);
const imageHeavySpeechElement = makeViewportSpeechElement(
  "Text placed below a tall image.",
  -100,
  920,
  () => [{ left: 100, right: 300, top: 850, bottom: 870, width: 200, height: 20 }]
);
elements["#viewer"].querySelectorAll = () => [
  aboveViewportSpeechElement,
  clippedViewportSpeechElement,
  partialViewportSpeechElement,
  fullViewportSpeechElement,
  imageHeavySpeechElement
];
const visibleSpeechEntries = vm.runInContext("speechEntriesFromViewport()", context);
assert.equal(
  JSON.stringify(visibleSpeechEntries.map((entry) => entry.text)),
  JSON.stringify(["visible words", "Fully visible text."])
);
assert.equal(visibleSpeechEntries[0].mapBaseOffset, 7);
context.partialViewportSpeechElement = partialViewportSpeechElement;
context.fullViewportSpeechElement = fullViewportSpeechElement;
assert.equal(
  vm.runInContext(
    "speechEntriesFromViewport({ element: partialViewportSpeechElement, offset: 15 })[0].text",
    context
  ),
  "words"
);
const plannedSpeechViewport = vm.runInContext(
  "nextSpeechViewport({ element: fullViewportSpeechElement, offset: createSpeechTextMap(fullViewportSpeechElement).text.length })",
  context
);
assert.equal(plannedSpeechViewport.offset > 0, true);
assert.equal(
  plannedSpeechViewport.entries.some((entry) => entry.text.includes("Text placed below")),
  true
);
const nestedQuoteElement = makeViewportSpeechElement(
  "First quoted paragraph. Second quoted paragraph.",
  100,
  300,
  () => []
);
const firstQuotedParagraph = makeViewportSpeechElement(
  "First quoted paragraph.",
  100,
  180,
  () => []
);
const secondQuotedParagraph = makeViewportSpeechElement(
  "Second quoted paragraph.",
  200,
  280,
  () => []
);
const directQuoteElement = makeViewportSpeechElement(
  "A quotation without paragraph children.",
  320,
  380,
  () => []
);
nestedQuoteElement.parentElement = elements["#viewer"];
firstQuotedParagraph.parentElement = nestedQuoteElement;
secondQuotedParagraph.parentElement = nestedQuoteElement;
directQuoteElement.parentElement = elements["#viewer"];
elements["#viewer"].querySelectorAll = () => [
  nestedQuoteElement,
  firstQuotedParagraph,
  secondQuotedParagraph,
  directQuoteElement
];
assert.equal(
  vm.runInContext("speechBlockElements().map((element) => element.textContent).join('|')", context),
  "First quoted paragraph.|Second quoted paragraph.|A quotation without paragraph children."
);
elements["#viewer"].querySelectorAll = () => [
  aboveViewportSpeechElement,
  clippedViewportSpeechElement,
  partialViewportSpeechElement,
  fullViewportSpeechElement,
  imageHeavySpeechElement
];
context.visibleSpeechEntries = visibleSpeechEntries;
assert.equal(
  vm.runInContext(
    "buildSpeechJobs(visibleSpeechEntries, 1, 12).every((job) => job.text.length <= 12)",
    context
  ),
  true
);
context.viewportSentenceEntries = [{
  element: null,
  text: "This sentence is complete. This sentence continues below the viewport"
}];
assert.equal(
  vm.runInContext(
    "speechSourceFromEntries(sentenceBoundedViewportEntries(viewportSentenceEntries)).text",
    context
  ),
  "This sentence is complete."
);
context.viewportLongSentenceEntries = [{
  element: null,
  text: "This unusually long sentence has no visible ending and must use the fallback"
}];
assert.equal(
  vm.runInContext(
    "speechSourceFromEntries(sentenceBoundedViewportEntries(viewportLongSentenceEntries)).text",
    context
  ),
  context.viewportLongSentenceEntries[0].text
);
assert.equal(
  vm.runInContext(
    "buildSpeechJobs(viewportLongSentenceEntries, 1, 200, false)[0].text.endsWith('.')",
    context
  ),
  false
);
context.viewportTrailingRemainderEntries = [{
  element: null,
  text: `${"Navigation ".repeat(30)}systems stable. Angular anomaly.`
}];
assert.equal(
  vm.runInContext(
    "buildSpeechJobs(viewportTrailingRemainderEntries, 100, 350, false).at(-1).text",
    context
  ),
  "Angular anomaly."
);
assert.equal(
  vm.runInContext(
    "buildViewportSpeechJobs(viewportTrailingRemainderEntries, 100, 350).length",
    context
  ),
  1
);
context.viewportOnlyShortEntry = [{ element: null, text: "Angular anomaly." }];
assert.equal(
  vm.runInContext("buildViewportSpeechJobs(viewportOnlyShortEntry, 100, 350).length", context),
  1
);
vm.runInContext(`
  globalThis.visibleSpeechJob = buildSpeechJobs(visibleSpeechEntries, 1, 80)[0];
  visibleSpeechJob.followText = false;
  setSpeechActiveJob(visibleSpeechJob);
`, context);
assert.equal(vm.runInContext("speechScrollFrame === null", context), true);
assert.equal(elements["#speech-marker"].hidden, false);
vm.runInContext("clearSpeechSelection()", context);
elements["#viewer"].querySelectorAll = () => [];

const speechElementOne = makeElement();
const speechElementTwo = makeElement();
const speechNodeOne = {
  nodeType: 3,
  nodeValue: "Alpha beta gamma.",
  parentElement: speechElementOne
};
const speechNodeTwo = {
  nodeType: 3,
  nodeValue: "Delta epsilon zeta eta theta. Iota kappa lambda mu nu xi omicron pi rho sigma tau.",
  parentElement: speechElementTwo
};
speechElementOne.textContent = speechNodeOne.nodeValue;
speechElementOne.textNodes = [speechNodeOne];
speechElementOne.getBoundingClientRect = () => ({
  left: speechBlockLeft,
  top: 650,
  bottom: 730
});
speechElementTwo.textContent = speechNodeTwo.nodeValue;
speechElementTwo.textNodes = [speechNodeTwo];
speechElementTwo.getBoundingClientRect = () => ({
  left: speechBlockLeftTwo,
  top: 520,
  bottom: 600
});
context.testSpeechEntries = [
  { element: speechElementOne, text: speechElementOne.textContent },
  { element: speechElementTwo, text: speechElementTwo.textContent }
];
vm.runInContext("globalThis.testSpeechJobs = buildSpeechJobs(testSpeechEntries, 30, 48)", context);
vm.runInContext("setSpeechActiveJob(testSpeechJobs[0])", context);
assert.equal(selectionRanges.length, 0);
assert.equal(createdRanges.at(-1).startNode, speechNodeOne);
assert.equal(createdRanges.at(-1).startOffset, 0);
assert.equal(createdRanges.at(-1).endNode, speechNodeTwo);
assert.equal(elements["#speech-marker"].hidden, false);
assert.equal(elements["#speech-marker"].style.left, "62px");
assert.equal(vm.runInContext("speechScrollFrame !== null", context), true);
speechRectLeft = 140;
speechBlockLeft = 120;
speechBlockLeftTwo = 80;
vm.runInContext("positionSpeechMarker(false)", context);
assert.equal(elements["#speech-marker"].style.left, "62px");
vm.runInContext("setSpeechActiveJob(testSpeechJobs[1])", context);
assert.equal(selectionRanges.length, 0);
assert.equal(createdRanges.at(-1).startNode, speechNodeTwo);
assert.equal(vm.runInContext("speechScrollFrame !== null", context), true);
speechRectLeft = 160;
speechBlockLeft = 100;
speechBlockLeftTwo = 100;
vm.runInContext("positionSpeechMarker(false)", context);
assert.equal(elements["#speech-marker"].style.left, "82px");
vm.runInContext("clearSpeechSelection()", context);
assert.equal(selectionRanges.length, 0);
assert.equal(elements["#speech-marker"].hidden, true);
assert.equal(vm.runInContext("speechScrollFrame === null", context), true);

const file = {
  name: "test.epub",
  async arrayBuffer() {
    return new Uint8Array([1, 2, 3, 4]).buffer;
  }
};

const drop = (droppedFile = file) => windowListeners.get("drop")({
  preventDefault() {},
  dataTransfer: { files: [droppedFile] }
});

(async () => {
  await wait(20);
  const backupPositionKey = "smooth-reader:position:backup-test";
  stored.set(backupPositionKey, JSON.stringify({ scrollY: 200, savedAt: 200 }));
  context.importedStorageFixture = {
    [backupPositionKey]: JSON.stringify({ scrollY: 100, savedAt: 100 })
  };
  vm.runInContext("mergeImportedStorage(importedStorageFixture)", context);
  assert.equal(JSON.parse(stored.get(backupPositionKey)).scrollY, 200);
  context.importedStorageFixture[backupPositionKey] = JSON.stringify({
    scrollY: 300,
    savedAt: 300
  });
  vm.runInContext("mergeImportedStorage(importedStorageFixture)", context);
  assert.equal(JSON.parse(stored.get(backupPositionKey)).scrollY, 300);
  stored.delete(backupPositionKey);

  context.existingBookFixture = [{ hash: "same", fileName: "same.epub", openedAt: 10 }];
  context.importedBookFixture = [
    { hash: "same", fileName: "same.epub", openedAt: 20, bytes: "imported" },
    ...Array.from({ length: 12 }, (_, index) => ({
      hash: `new-${index}`,
      fileName: `new-${index}.epub`,
      openedAt: 30 + index
    }))
  ];
  const mergedBookFixture = vm.runInContext(
    "mergeBookCollections(existingBookFixture, importedBookFixture)",
    context
  );
  assert.equal(mergedBookFixture.length, 12);
  assert.equal(mergedBookFixture[0].fileName, "new-11.epub");

  const speechScrollCallCount = scrollCalls.length;
  await vm.runInContext("scrollDownAfterSpeechJob(testSpeechJobs[0])", context);
  assert.equal(scrollCalls.length > speechScrollCallCount, true);
  assert.equal(context.window.scrollY > 0, true);
  context.window.scrollY = 0;
  context.document.hidden = true;
  context.document.visibilityState = "hidden";
  const hiddenScrollCallCount = scrollCalls.length;
  vm.runInContext("animateSpeechScrollBy(240)", context);
  assert.equal(scrollCalls.length, hiddenScrollCallCount + 1);
  assert.equal(vm.runInContext("speechScrollFrame === null", context), true);
  assert.equal(
    await vm.runInContext("ensureSpeechJobVisible(testSpeechJobs[0])", context),
    true
  );
  context.document.hidden = false;
  context.document.visibilityState = "visible";
  documentListeners.get("visibilitychange")();
  context.window.scrollY = 0;
  assert.equal(fetchCalls.filter((path) => path === "/api/piper/status").length, 1);
  assert.equal(elements["#settings-speech-voice"].children.length, 4);
  assert.equal(elements["#settings-speech-speaker-row"].hidden, true);
  assert.equal(elements["#settings-speech-speaker"].children.length, 1);
  assert.equal(elements["#speech-controls"].hidden, true);
  assert.equal(elements["#recent-books"].hidden, false);
  assert.equal(elements["#recent-book-list"].children.length, 1);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Previous Book — previous.epub"
  );
  assert.equal(elements["#recent-book-list"].children[0].disabled, false);
  assert.equal(
    elements["#recent-book-list"].children[0].classList.contains("has-cover"),
    true
  );
  assert.match(
    elements["#recent-book-list"].children[0].style["--recent-book-cover"],
    /^url\("data:image\/jpeg/
  );
  assert.equal(elements["#start-reopen"].disabled, false);
  assert.equal(elements["#start-manage-library"].disabled, false);
  assert.equal(elements["#library-manage-actions"].hidden, true);
  assert.equal(elements["#start-store-server"].hidden, true);
  assert.equal(elements["#start-remove-server"].hidden, true);

  const serverHashFixture = "a".repeat(64);
  context.serverBookFixture = {
    hash: serverHashFixture,
    fileName: "remote.epub",
    title: "Remote Book",
    openedAt: Date.now() + 10_000,
    coverUrl: `/api/library/books/${serverHashFixture}/cover`,
    serverStored: true
  };
  vm.runInContext(`
    serverBookInfo = [serverBookFixture];
    serverBookHashes.add(serverBookFixture.hash);
    setServerLibraryAvailable(true);
    renderRecentBooks();
  `, context);
  assert.equal(elements["#start-store-server"].hidden, false);
  assert.equal(elements["#start-remove-server"].hidden, false);
  assert.equal(elements["#recent-book-list"].children.length, 2);
  assert.equal(
    elements["#recent-book-list"].children[0].classList.contains("is-server-stored"),
    true
  );
  context.serverStateFixture = {
    hash: serverHashFixture,
    position: { scrollY: 840, ratio: 0.5, savedAt: 900 },
    settings: { palette: "paper", font: "noto-serif", savedAt: 901 }
  };
  vm.runInContext("mergeServerBookState(serverBookFixture.hash, serverStateFixture)", context);
  assert.equal(
    JSON.parse(stored.get(`smooth-reader:position:${serverHashFixture}`)).scrollY,
    840
  );
  assert.equal(
    JSON.parse(stored.get(`smooth-reader:book-settings:${serverHashFixture}`)).font,
    "noto-serif"
  );
  stored.delete(`smooth-reader:position:${serverHashFixture}`);
  stored.delete(`smooth-reader:book-settings:${serverHashFixture}`);
  vm.runInContext(`
    serverBookInfo = [];
    serverBookHashes.clear();
    setServerLibraryAvailable(false);
    renderRecentBooks();
  `, context);

  context.window.JSZip = function JSZipFixture() {};
  context.window.JSZip.loadAsync = async () => {
    throw new Error("corrupt central directory");
  };
  await assert.rejects(
    vm.runInContext("validateEpubBytes(new Uint8Array([1, 2, 3]).buffer)", context),
    /Invalid or damaged EPUB archive/
  );
  delete context.window.JSZip;
  assert.equal(elements["#settings-palette"].children.length, 16);
  assert.equal(elements["#settings-font"].children.length, 12);
  assert.equal(elements["#settings-contrast-value"].textContent, "0%");
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "0%");
  assert.equal(elements["#settings-width-value"].textContent, "≈ 44 chars");
  assert.equal(elements["#settings-font-size-value"].textContent, "36px");
  assert.equal(elements["#settings-line-height-value"].textContent, "1.28");
  assert.equal(vm.runInContext("speechMinimumLength", context), 150);
  assert.equal(elements["#settings-speech-max-value"].textContent, "550 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "0%");
  assert.equal(elements["#settings-speech-speed-value"].textContent, "0%");
  assert.equal(elements["#speech-audio"].playbackRate, 1);
  assert.equal(stored.get("smooth-reader:speech-center-offset"), "0");
  assert.equal(stored.get("smooth-reader:speech-speed"), "0");
  assert.equal(vm.runInContext("speechTargetCenterY(80)", context), 400);
  vm.runInContext("applySpeechCenterOffset(25)", context);
  assert.equal(elements["#settings-speech-position-value"].textContent, "+25%");
  assert.equal(vm.runInContext("speechTargetCenterY(80)", context), 600);
  assert.equal(vm.runInContext("speechTargetCenterY(760)", context), 404);
  assert.equal(vm.runInContext("speechViewportBounds(790).top", context), 5);
  assert.equal(
    vm.runInContext(
      "speechScrollOffsetForRects([{ top: -20, bottom: 800, height: 820, width: 200 }])",
      context
    ),
    -20
  );
  vm.runInContext("applySpeechCenterOffset(0)", context);
  vm.runInContext("applySpeechSpeed(33)", context);
  assert.equal(elements["#settings-speech-speed-value"].textContent, "+33%");
  assert.equal(elements["#speech-audio"].playbackRate, 1.33);
  assert.equal(elements["#speech-audio"].preservesPitch, true);
  vm.runInContext("applySpeechSpeed(0)", context);
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(vm.runInContext("speechAudioFormat", context), "opus");

  const prefetchedAudio = await vm.runInContext(
    "preloadPreparedAudio({ audioUrl: '/api/piper/audio/prefetched-cache-id', audioFormat: 'opus' }, speechGeneration)",
    context
  );
  assert.equal(prefetchedAudio.prefetchedAudioUrl, "blob:smooth-reader-1");
  assert.equal(fetchCalls.includes("/api/piper/audio/prefetched-cache-id"), true);

  elements["#speech-audio"].autoEnd = true;
  context.prefetchedAudio = prefetchedAudio;
  await vm.runInContext("playPreparedAudio(prefetchedAudio)", context);
  assert.equal(elements["#speech-audio"].src, "");
  assert.equal(revokedObjectUrls.includes("blob:smooth-reader-1"), true);
  assert.equal(vm.runInContext("speechPrefetchedUrls.size", context), 0);
  elements["#speech-audio"].autoEnd = false;
  vm.runInContext(
    "speechIsActive = true; speechIsPaused = false; speechAudio.src = '/api/piper/audio/test';",
    context
  );
  await vm.runInContext("toggleSpeechPause()", context);
  assert.equal(elements["#speech-audio"].paused, true);
  assert.equal(elements["#settings-speech-pause"].textContent, "CONTINUE");
  assert.equal(elements["#speech-overlay-pause"].textContent, "▶");
  await vm.runInContext("toggleSpeechPause()", context);
  assert.equal(elements["#speech-audio"].paused, false);
  assert.equal(elements["#settings-speech-pause"].textContent, "PAUSE");
  assert.equal(elements["#speech-overlay-pause"].textContent, "Ⅱ");
  vm.runInContext("speechIsActive = false; releaseSpeechAudio();", context);

  drop();
  await wait(80);

  assert.equal(elements["#reader"].hidden, false);
  assert.equal(elements["#drop-zone"].hidden, true);
  assert.equal(elements["#settings-menu"].hidden, false);
  assert.equal(elements["#reading-progress"].hidden, false);
  assert.equal(elements["#speech-controls"].hidden, false);
  assert.equal(elements["#speech-overlay-pause"].hidden, false);
  assert.equal(elements["#speech-overlay-stop"].hidden, false);
  assert.equal(elements["#speech-overlay-home"].hidden, false);
  assert.equal(elements["#speech-overlay-pause"].disabled, false);
  assert.equal(elements["#speech-overlay-pause"].textContent, "▶");
  assert.equal(elements["#speech-overlay-stop"].disabled, true);
  assert.equal(context.document.documentElement.dataset.view, "reader");
  vm.runInContext("piperAvailable = false; syncSpeechControls();", context);
  assert.equal(elements["#speech-overlay-pause"].hidden, true);
  assert.equal(elements["#speech-overlay-stop"].hidden, true);
  assert.equal(elements["#speech-controls"].hidden, false);
  assert.equal(elements["#speech-overlay-home"].hidden, false);
  vm.runInContext("piperAvailable = true; syncSpeechControls();", context);
  assert.equal(elements["#viewer"].children.length, 2);
  assert.deepEqual(renderedSections, [1, 2]);
  assert.equal(unloadedSections, 2);
  assert.equal(context.document.title, "Test Book — Smooth Reader");
  assert.equal(elements["#recent-book-list"].children.length, 2);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Test Book — test.epub"
  );
  assert.equal(JSON.parse(stored.get("smooth-reader:last-book")).fileName, "test.epub");

  assert.equal(elements["#viewer"].listeners.has("wheel"), false);
  assert.equal(elements["#viewer"].listeners.has("pointerdown"), false);
  assert.equal(windowListeners.has("pointerdown"), true);
  assert.equal(windowListeners.has("wheel"), true);
  assert.equal(windowListeners.has("keydown"), true);

  let rightDragPrevented = false;
  windowListeners.get("pointerdown")({
    button: 2,
    pointerId: 9,
    clientY: 300,
    target: elements["#viewer"],
    preventDefault() {
      rightDragPrevented = true;
    }
  });
  assert.equal(rightDragPrevented, true);
  assert.equal(elements["#viewer"].capturedPointer, 9);

  windowListeners.get("pointermove")({
    pointerId: 9,
    buttons: 2,
    clientY: 280,
    preventDefault() {}
  });
  await wait(10);
  assert.equal(scrollByCalls.at(-1).top, -27);
  assert.equal(scrollByCalls.at(-1).behavior, "auto");

  windowListeners.get("pointerup")({
    pointerId: 9,
    button: 2,
    preventDefault() {}
  });
  assert.equal(elements["#viewer"].capturedPointer, null);

  const sourceChapter = elements["#viewer"].children[0];
  const targetChapter = elements["#viewer"].children[1];
  const chapterAnchor = {
    getAttribute(name) {
      return name === "href" ? "chapter-2.xhtml" : null;
    },
    closest(selector) {
      return selector === ".book-section" ? sourceChapter : null;
    }
  };
  let chapterLinkPrevented = false;
  elements["#viewer"].listeners.get("click")({
    target: {
      closest(selector) {
        return selector === "a[href]" ? chapterAnchor : null;
      }
    },
    preventDefault() {
      chapterLinkPrevented = true;
    }
  });
  assert.equal(chapterLinkPrevented, true);
  assert.equal(targetChapter.lastScrollIntoView.behavior, "smooth");
  assert.equal(targetChapter.lastScrollIntoView.block, "start");

  context.window.scrollY = 800;
  windowListeners.get("scroll")();
  await wait(220);
  assert.equal(elements["#reading-progress"].textContent, "36%");

  const storedPositionEntry = [...stored.entries()]
    .find(([key]) => key.startsWith("smooth-reader:position:"));
  const storedPosition = JSON.parse(storedPositionEntry[1]);
  assert.equal(storedPosition.scrollY, 800);
  assert.ok(Math.abs(storedPosition.ratio - (800 / 2200)) < 0.0001);

  drop();
  await wait(80);

  assert.equal(elements["#viewer"].children.length, 2);
  assert.equal(scrollCalls.at(-1), 800);
  assert.deepEqual(renderedSections, [1, 2, 1, 2]);

  const pressKey = (key, overrides = {}) => {
    let prevented = false;
    windowListeners.get("keydown")({
      key,
      defaultPrevented: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      repeat: false,
      preventDefault() {
        prevented = true;
      },
      ...overrides
    });
    return prevented;
  };

  context.window.scrollY = 900;
  assert.equal(pressKey("o"), true);
  assert.equal(elements["#file-input"].clickCount, 1);

  assert.equal(pressKey("Home"), true);
  assert.equal(scrollCalls.at(-1), 0);

  assert.equal(pressKey("End"), true);
  assert.equal(scrollCalls.at(-1), 3000);

  assert.equal(pressKey("PageDown"), true);
  assert.equal(scrollByCalls.at(-1).top, 704);
  assert.equal(scrollByCalls.at(-1).behavior, "smooth");

  assert.equal(pressKey("PageUp"), true);
  assert.equal(scrollByCalls.at(-1).top, -704);

  const currentBookSettings = () => JSON.parse(
    [...stored.entries()].find(([key]) => key.startsWith("smooth-reader:book-settings:"))[1]
  );
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(pressKey("p"), true);
  assert.equal(context.document.documentElement.dataset.palette, "solarized");
  assert.equal(currentBookSettings().palette, "solarized");

  assert.equal(pressKey("P", { shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "nord");

  assert.equal(pressKey("6", { altKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "paper");

  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  anchorRectCalls = 0;
  assert.equal(pressKey("f"), true);
  assert.equal(context.document.documentElement.dataset.font, "eb-garamond");
  assert.equal(currentBookSettings().font, "eb-garamond");
  await wait(20);
  assert.equal(scrollByCalls.at(-1).top, 60);
  assert.equal(scrollByCalls.at(-1).behavior, "auto");

  const originalCaretPositionFromPoint = context.document.caretPositionFromPoint;
  const originalCreateRange = context.document.createRange;
  context.document.caretPositionFromPoint = (_x, y) => ({
    offsetNode: anchorTextNode,
    offset: y < 21 ? 0 : 1
  });
  context.document.createRange = () => ({
    setStart(_node, offset) {
      this.offset = offset;
    },
    setEnd() {},
    getBoundingClientRect() {
      return this.offset === 0
        ? { top: -8, bottom: 12, left: 100, right: 300 }
        : { top: 24, bottom: 44, left: 100, right: 300 };
    }
  });
  const firstVisibleAnchor = vm.runInContext(
    "captureFirstFullyVisibleTextAnchor()",
    context
  );
  assert.equal(firstVisibleAnchor.offset, 1);
  assert.equal(firstVisibleAnchor.viewportTop, 24);
  context.document.caretPositionFromPoint = originalCaretPositionFromPoint;
  context.document.createRange = originalCreateRange;

  anchorRectCalls = 0;
  vm.runInContext("stableResizeAnchor = captureLayoutAnchor()", context);
  const resizeScrollCount = scrollByCalls.length;
  windowListeners.get("resize")();
  await wait(20);
  assert.equal(scrollByCalls.length, resizeScrollCount + 1);
  assert.equal(scrollByCalls.at(-1).top, 60);
  assert.equal(scrollByCalls.at(-1).behavior, "auto");
  await wait(170);

  assert.equal(pressKey("F", { shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.font, "alegreya");

  assert.equal(pressKey("7", { altKey: true, shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.font, "crimson-pro");

  assert.equal(pressKey("0", { altKey: true, shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.font, "merriweather");

  assert.equal(pressKey("0", { altKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "plum");

  assert.equal(pressKey("M", { altKey: true, shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.font, "system-mono");

  assert.equal(
    context.document.documentElement.style["--reader-tracking"],
    "0.02em"
  );
  assert.equal(pressKey("+", { shiftKey: true }), true);
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.03em");
  assert.equal(currentBookSettings().tracking, 0.03);

  assert.equal(pressKey("-"), true);
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.02em");

  assert.equal(pressKey("-"), true);
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.01em");

  assert.equal(pressKey("0"), true);
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.02em");

  assert.equal(pressKey("]"), true);
  assert.equal(context.document.documentElement.style["--reader-font-size"], "38px");
  assert.equal(currentBookSettings().fontSize, 38);
  assert.equal(pressKey("["), true);
  assert.equal(context.document.documentElement.style["--reader-font-size"], "36px");

  assert.equal(pressKey("}"), true);
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.32");
  assert.equal(currentBookSettings().lineHeight, 1.32);
  assert.equal(pressKey("{"), true);
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.28");

  elements["#settings-font-size"].listeners.get("input")({ target: { value: "24" } });
  assert.equal(context.document.documentElement.style["--reader-font-size"], "24px");
  elements["#settings-font-size-down"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-font-size"], "22px");
  elements["#settings-font-size-up"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-font-size"], "24px");
  elements["#settings-line-height"].listeners.get("input")({ target: { value: "1.88" } });
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.88");
  elements["#settings-line-height-down"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.84");
  elements["#settings-line-height-up"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.88");

  elements["#settings-width"].listeners.get("input")({ target: { value: "84" } });
  assert.equal(context.document.documentElement.style["--reader-width"], "84ch");
  elements["#settings-width-down"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-width"], "82ch");
  elements["#settings-width-up"].listeners.get("click")();
  assert.equal(context.document.documentElement.style["--reader-width"], "84ch");
  elements["#settings-width"].listeners.get("input")({ target: { value: "8" } });
  assert.equal(context.document.documentElement.style["--reader-width"], "8ch");
  assert.equal(elements["#settings-width-down"].disabled, true);
  elements["#settings-width"].listeners.get("input")({ target: { value: "84" } });
  assert.equal(elements["#settings-width-value"].textContent, "≈ 84 chars");
  assert.equal(currentBookSettings().width, 84);

  elements["#settings-toggle"].listeners.get("click")();
  assert.equal(elements["#settings-panel"].hidden, false);
  assert.equal(elements["#settings-toggle"].getAttribute("aria-expanded"), "true");
  assert.equal(elements["#fullscreen-toggle"].hidden, false);
  assert.equal(elements["#fullscreen-toggle"].getAttribute("aria-pressed"), "false");
  elements["#fullscreen-toggle"].listeners.get("click")();
  await wait(0);
  assert.equal(context.document.fullscreenElement, context.document.documentElement);
  assert.equal(elements["#fullscreen-toggle"].getAttribute("aria-pressed"), "true");
  assert.equal(elements["#fullscreen-toggle"].getAttribute("aria-label"), "Exit fullscreen");
  elements["#fullscreen-toggle"].listeners.get("click")();
  await wait(0);
  assert.equal(context.document.fullscreenElement, null);
  assert.equal(elements["#fullscreen-toggle"].getAttribute("aria-pressed"), "false");
  assert.equal(elements["#fullscreen-toggle"].getAttribute("aria-label"), "Enter fullscreen");

  elements["#settings-palette"].listeners.get("change")({
    target: { value: "nord" }
  });
  assert.equal(context.document.documentElement.dataset.palette, "nord");

  elements["#settings-contrast"].listeners.get("input")({ target: { value: "-15" } });
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "15%");
  assert.equal(elements["#settings-contrast-value"].textContent, "-15%");
  elements["#settings-contrast"].listeners.get("change")({ target: { value: "20" } });
  assert.equal(context.document.documentElement.style["--contrast-strength"], "20%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "0%");
  assert.equal(elements["#settings-contrast-value"].textContent, "+20%");
  assert.equal(currentBookSettings().contrast, 20);
  elements["#settings-contrast-down"].listeners.get("click")();
  assert.equal(elements["#settings-contrast-value"].textContent, "+19%");
  elements["#settings-contrast-up"].listeners.get("click")();
  assert.equal(elements["#settings-contrast-value"].textContent, "+20%");

  assert.equal(elements["#recent-book-list"].children[0].listeners.has("click"), true);
  assert.equal(elements["#start-open"].listeners.has("click"), true);
  assert.equal(elements["#start-export-library"].listeners.has("click"), true);
  assert.equal(elements["#start-import-library"].listeners.has("click"), true);
  assert.equal(elements["#start-manage-library"].listeners.has("click"), true);
  assert.equal(elements["#start-store-server"].listeners.has("click"), true);
  assert.equal(elements["#start-remove-local"].listeners.has("click"), true);
  assert.equal(elements["#start-remove-server"].listeners.has("click"), true);
  assert.equal(elements["#start-cancel-manage"].listeners.has("click"), true);
  assert.equal(elements["#library-import-input"].listeners.has("change"), true);
  assert.equal(elements["#settings-speech-start"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-pause"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-stop"].listeners.has("click"), true);
  assert.equal(elements["#speech-overlay-pause"].listeners.has("click"), true);
  assert.equal(elements["#speech-overlay-stop"].listeners.has("click"), true);
  assert.equal(elements["#speech-overlay-home"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-voice"].listeners.has("change"), true);
  assert.equal(elements["#settings-speech-speaker"].listeners.has("change"), true);
  elements["#settings-speech-voice"].listeners.get("change")({
    target: { value: "voice-one.onnx" }
  });
  assert.equal(elements["#settings-speech-speaker-row"].hidden, false);
  assert.equal(elements["#settings-speech-speaker"].children.length, 4);
  assert.equal(elements["#settings-speech-speaker"].children[0].textContent, "RANDOM ID");
  assert.equal(elements["#settings-speech-speaker"].children[1].textContent, "ID 0 — ALPHA");
  assert.equal(elements["#settings-speech-speaker"].children[2].textContent, "ID 1");
  assert.equal(elements["#settings-speech-speaker"].children[3].textContent, "ID 2 — GAMMA");
  elements["#settings-speech-speaker"].listeners.get("change")({
    target: { value: "2" }
  });
  assert.equal(vm.runInContext("speechSpeakerPreference", context), "2");
  assert.equal(vm.runInContext("captureReadingSettings().speaker", context), "2");
  elements["#settings-speech-voice"].listeners.get("change")({
    target: { value: "voice-large.onnx" }
  });
  assert.equal(elements["#settings-speech-speaker"].children.length, 902);
  assert.equal(elements["#settings-speech-speaker"].children.at(-1).textContent, "ID 900");
  elements["#settings-speech-voice"].listeners.get("change")({
    target: { value: "voice-two.onnx" }
  });
  assert.equal(elements["#settings-speech-speaker-row"].hidden, true);
  assert.equal(vm.runInContext("speechSpeakerPreference", context), "");
  for (const button of [
    "#settings-contrast-down", "#settings-contrast-up",
    "#settings-line-height-down", "#settings-line-height-up",
    "#settings-width-down", "#settings-width-up",
    "#settings-speech-max-down", "#settings-speech-max-up",
    "#settings-speech-position-down", "#settings-speech-position-up",
    "#settings-speech-speed-down", "#settings-speech-speed-up",
    "#settings-reset-book"
  ]) {
    assert.equal(elements[button].listeners.has("click"), true, button);
  }

  elements["#settings-speech-max"].listeners.get("change")({ target: { value: "700" } });
  assert.equal(vm.runInContext("speechMinimumLength", context), 150);
  assert.equal(elements["#settings-speech-max-value"].textContent, "700 chars");
  assert.equal(stored.has("smooth-reader:speech-minimum"), false);
  assert.equal(currentBookSettings().speechMaximum, 700);
  elements["#settings-speech-position"].listeners.get("input")({
    target: { value: "-8" }
  });
  assert.equal(elements["#settings-speech-position-value"].textContent, "-8%");
  assert.equal(currentBookSettings().speechCenterOffset, -8);
  elements["#settings-speech-speed"].listeners.get("input")({
    target: { value: "20" }
  });
  assert.equal(elements["#settings-speech-speed-value"].textContent, "+20%");
  assert.equal(elements["#speech-audio"].playbackRate, 1.2);
  assert.equal(currentBookSettings().speechSpeed, 20);
  elements["#settings-speech-max-down"].listeners.get("click")();
  assert.equal(elements["#settings-speech-max-value"].textContent, "650 chars");
  elements["#settings-speech-max-up"].listeners.get("click")();
  assert.equal(elements["#settings-speech-max-value"].textContent, "700 chars");
  elements["#settings-speech-position-down"].listeners.get("click")();
  assert.equal(elements["#settings-speech-position-value"].textContent, "-9%");
  elements["#settings-speech-position-up"].listeners.get("click")();
  assert.equal(elements["#settings-speech-position-value"].textContent, "-8%");

  assert.equal(pressKey("r"), false);
  await wait(80);
  assert.equal(elements["#viewer"].children.length, 2);
  assert.deepEqual(renderedSections, [1, 2, 1, 2]);

  const secondFile = {
    name: "second.epub",
    async arrayBuffer() {
      return new Uint8Array([5, 2, 3, 4]).buffer;
    }
  };
  const thirdFile = {
    name: "third.epub",
    async arrayBuffer() {
      return new Uint8Array([6, 2, 3, 4]).buffer;
    }
  };

  drop(secondFile);
  await wait(80);
  drop(thirdFile);
  await wait(80);

  assert.equal(elements["#recent-book-list"].children.length, 4);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Test Book — third.epub"
  );
  assert.equal(
    elements["#recent-book-list"].children[1].textContent,
    "Test Book — second.epub"
  );
  assert.deepEqual(
    JSON.parse(stored.get("smooth-reader:recent-books")).map((book) => book.fileName),
    ["third.epub", "second.epub", "test.epub", "previous.epub"]
  );

  elements["#recent-book-list"].children[1].listeners.get("click")();
  await wait(80);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Test Book — second.epub"
  );
  assert.equal(renderedSections.length, 10);
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--reader-font-size"], "36px");
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.28");
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.02em");
  assert.equal(context.document.documentElement.style["--reader-width"], "44ch");
  assert.equal(elements["#settings-speech-max-value"].textContent, "550 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "0%");
  assert.equal(elements["#settings-speech-speed-value"].textContent, "0%");
  assert.deepEqual(JSON.parse(vm.runInContext(
    "JSON.stringify(captureReadingSettings())",
    context
  )), {
    palette: "nord",
    contrast: 0,
    font: "alegreya",
    fontSize: 36,
    lineHeight: 1.28,
    tracking: 0.02,
    width: 44,
    voice: "",
    speaker: "",
    speechMaximum: 550,
    speechCenterOffset: 0,
    speechSpeed: 0
  });
  elements["#settings-font-size"].listeners.get("input")({ target: { value: "60" } });
  assert.equal(context.document.documentElement.style["--reader-font-size"], "60px");
  elements["#settings-palette"].listeners.get("change")({
    target: { value: "forest" }
  });
  elements["#settings-contrast"].listeners.get("change")({ target: { value: "-10" } });
  elements["#settings-speech-max"].listeners.get("change")({ target: { value: "850" } });
  elements["#settings-speech-position"].listeners.get("input")({ target: { value: "5" } });
  elements["#recent-book-list"].children[2].listeners.get("click")();
  await wait(80);
  assert.equal(context.document.documentElement.style["--reader-font-size"], "24px");
  assert.equal(context.document.documentElement.style["--reader-width"], "84ch");
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(elements["#settings-contrast-value"].textContent, "+20%");
  assert.equal(elements["#settings-speech-max-value"].textContent, "700 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "-8%");
  assert.equal(elements["#settings-speech-speed-value"].textContent, "+20%");
  assert.equal(renderedSections.length, 12);

  let releaseSlowBook;
  const slowBook = {
    name: "slow.epub",
    arrayBuffer() {
      return new Promise((resolve) => {
        releaseSlowBook = () => resolve(new Uint8Array([7, 2, 3, 4]).buffer);
      });
    }
  };
  drop(slowBook);
  await wait(10);
  assert.equal(vm.runInContext("isBookLoading", context), true);
  assert.equal(elements["#start-reopen"].disabled, true);
  assert.equal(pressKey("r"), false);
  assert.equal(renderedSections.length, 12);
  releaseSlowBook();
  await wait(100);
  assert.equal(vm.runInContext("isBookLoading", context), false);
  assert.equal(vm.runInContext("positionPersistenceSuspended", context), false);
  assert.equal(renderedSections.length, 14);
  assert.equal(context.window.history.state.view, "reader");
  const loadedSectionCount = elements["#viewer"].children.length;

  elements["#settings-home"].listeners.get("click")();
  await wait(10);
  assert.equal(elements["#drop-zone"].hidden, false);
  assert.equal(elements["#reader"].hidden, true);
  assert.equal(elements["#settings-menu"].hidden, true);
  assert.equal(elements["#reading-progress"].hidden, true);
  assert.equal(elements["#recent-book-list"].children.length, 5);
  assert.equal(context.document.title, "Smooth Reader");
  assert.equal(context.window.history.state.view, "home");
  assert.equal(context.window.scrollY, 0);
  assert.equal(context.document.documentElement.dataset.view, "home");
  assert.equal(elements["#viewer"].children.length, loadedSectionCount);

  const paletteOnHome = context.document.documentElement.dataset.palette;
  assert.equal(pressKey("p"), false);
  assert.equal(context.document.documentElement.dataset.palette, paletteOnHome);

  context.window.history.forward();
  await wait(10);
  assert.equal(elements["#drop-zone"].hidden, true);
  assert.equal(elements["#reader"].hidden, false);
  assert.equal(context.window.history.state.view, "reader");
  elements["#speech-overlay-home"].listeners.get("click")();
  await wait(10);
  assert.equal(elements["#drop-zone"].hidden, false);
  assert.equal(context.window.history.state.view, "home");

  const rememberedLastBook = stored.get("smooth-reader:last-book");
  const rememberedRecentBooks = stored.get("smooth-reader:recent-books");
  const rememberedPositions = new Map(
    [...stored.entries()].filter(([key]) => key.startsWith("smooth-reader:position:"))
  );
  elements["#settings-reset-book"].listeners.get("click")();
  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(context.document.documentElement.style["--reader-font-size"], "36px");
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.28");
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.02em");
  assert.equal(context.document.documentElement.style["--reader-width"], "44ch");
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "0%");
  assert.equal(elements["#settings-speech-max-value"].textContent, "550 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "0%");
  assert.equal(elements["#settings-speech-speed-value"].textContent, "0%");
  const activeSettingsKey = `smooth-reader:book-settings:${vm.runInContext("activeBookKey", context)}`;
  const resetSettings = JSON.parse(stored.get(activeSettingsKey));
  assert.equal(Number.isFinite(resetSettings.savedAt), true);
  delete resetSettings.savedAt;
  assert.deepEqual(resetSettings, {
    palette: "nord",
    contrast: 0,
    font: "alegreya",
    fontSize: 36,
    lineHeight: 1.28,
    tracking: 0.02,
    width: 44,
    voice: "",
    speaker: "",
    speechMaximum: 550,
    speechCenterOffset: 0,
    speechSpeed: 0
  });

  assert.equal(vm.runInContext("speechMinimumLength", context), 150);
  assert.equal(stored.get("smooth-reader:last-book"), rememberedLastBook);
  assert.equal(stored.get("smooth-reader:recent-books"), rememberedRecentBooks);
  assert.deepEqual(
    new Map([...stored.entries()].filter(([key]) => key.startsWith("smooth-reader:position:"))),
    rememberedPositions
  );
  assert.equal(stored.has("smooth-reader:book-settings:"), false);

  const booksBeforeRemoval = JSON.parse(
    vm.runInContext("JSON.stringify(recentBookInfo.slice(0, 2))", context)
  );
  const removedHashes = booksBeforeRemoval.map((record) => record.hash);
  removedHashes.forEach((hash) => {
    assert.equal(stored.has(`smooth-reader:book-settings:${hash}`), true);
  });
  elements["#start-manage-library"].listeners.get("click")();
  assert.equal(vm.runInContext("libraryManageMode", context), true);
  assert.equal(elements["#library-manage-actions"].hidden, false);
  assert.equal(elements["#recent-book-list"].classList.contains("is-managing"), true);
  elements["#recent-book-list"].children[0].listeners.get("click")();
  elements["#recent-book-list"].children[1].listeners.get("click")();
  assert.equal(elements["#start-remove-local"].disabled, false);
  assert.equal(elements["#recent-book-list"].children[0].getAttribute("aria-pressed"), "true");
  assert.equal(elements["#recent-book-list"].children[1].getAttribute("aria-pressed"), "true");
  elements["#start-remove-local"].listeners.get("click")();
  await wait(30);
  assert.match(confirmPrompts.at(-1), /Remove these 2 books/);
  assert.equal(elements["#recent-book-list"].children.length, 3);
  assert.equal(elements["#library-manage-actions"].hidden, true);
  assert.equal(elements["#recent-book-list"].classList.contains("is-managing"), false);
  assert.equal(vm.runInContext("activeBookKey", context), null);
  assert.equal(elements["#viewer"].children.length, 0);
  removedHashes.forEach((hash) => {
    assert.equal(stored.has(`smooth-reader:position:${hash}`), false);
    assert.equal(stored.has(`smooth-reader:book-settings:${hash}`), false);
  });
  assert.equal(JSON.parse(stored.get("smooth-reader:recent-books")).length, 3);
  assert.equal(JSON.parse(stored.get("smooth-reader:last-book")).fileName, "second.epub");
  assert.equal(indexedRecords.get("recent-books").length, 3);
  assert.equal(indexedRecords.has("last-opened"), false);

  console.log("renderer DOM smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
