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
    files: null,
    disabled: false,
    className: "",
    style: {},
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
  "#start-palette-next": makeElement(),
  "#start-palette": makeElement(),
  "#start-contrast": makeElement(),
  "#start-contrast-value": makeElement(),
  "#start-contrast-down": makeElement(),
  "#start-contrast-up": makeElement(),
  "#start-font-next": makeElement(),
  "#start-font": makeElement(),
  "#start-font-size": makeElement(),
  "#start-font-size-value": makeElement(),
  "#start-font-size-down": makeElement(),
  "#start-font-size-up": makeElement(),
  "#start-line-height": makeElement(),
  "#start-line-height-value": makeElement(),
  "#start-line-height-down": makeElement(),
  "#start-line-height-up": makeElement(),
  "#start-tracking-down": makeElement(),
  "#start-tracking-reset": makeElement(),
  "#start-tracking-up": makeElement(),
  "#start-width": makeElement(),
  "#start-width-value": makeElement(),
  "#start-width-down": makeElement(),
  "#start-width-up": makeElement(),
  "#start-reset-all": makeElement(),
  "#settings-menu": makeElement(),
  "#settings-toggle": makeElement(),
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
  "#settings-speech-min": makeElement(),
  "#settings-speech-min-value": makeElement(),
  "#settings-speech-min-down": makeElement(),
  "#settings-speech-min-up": makeElement(),
  "#settings-speech-max": makeElement(),
  "#settings-speech-max-value": makeElement(),
  "#settings-speech-max-down": makeElement(),
  "#settings-speech-max-up": makeElement(),
  "#settings-speech-position": makeElement(),
  "#settings-speech-position-value": makeElement(),
  "#settings-speech-position-down": makeElement(),
  "#settings-speech-position-up": makeElement(),
  "#settings-speech-start": makeElement(),
  "#settings-speech-pause": makeElement(),
  "#settings-speech-stop": makeElement(),
  "#settings-speech-status": makeElement(),
  "#settings-home": makeElement(),
  "#settings-page-up": makeElement(),
  "#settings-page-down": makeElement(),
  "#settings-open": makeElement(),
  "#settings-reopen": makeElement(),
  "#settings-reset-all": makeElement(),
  "#speech-voice": makeElement(),
  "#speech-progress": makeElement(),
  "#speech-controls": makeElement(),
  "#speech-overlay-pause": makeElement(),
  "#speech-overlay-stop": makeElement(),
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
elements["#reading-progress"].hidden = true;
elements["#speech-progress"].hidden = true;
elements["#speech-voice"].hidden = true;
elements["#speech-controls"].hidden = true;
elements["#speech-marker"].hidden = true;

const windowListeners = new Map();
const stored = new Map();
stored.set("smooth-reader:last-book", JSON.stringify({
  fileName: "previous.epub",
  title: "Previous Book"
}));
const indexedRecords = new Map([
  ["last-opened", {
    fileName: "previous.epub",
    title: "Previous Book",
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
let speechRectLeft = 120;
let speechBlockLeft = 80;
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
    fonts: { ready: Promise.resolve() },
    documentElement: {
      scrollHeight: 3000,
      dataset: {},
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
    setTimeout,
    clearTimeout,
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
const stylesSource = fs.readFileSync(path.join(__dirname, "..", "styles-v36-mobile5.css"), "utf8");
const fontsDirectory = path.join(__dirname, "..", "vendor", "fonts");
const fontsSource = fs.readFileSync(path.join(fontsDirectory, "reader-fonts.css"), "utf8");
assert.match(indexSource, /styles-v36-mobile5\.css/);
assert.match(indexSource, /renderer-v36\.js/);
assert.match(indexSource, /id="recent-books"/);
assert.match(indexSource, /id="start-hotkeys"/);
assert.match(indexSource, /Alt\+Shift\+1…9\/0/);
assert.match(indexSource, /Middle-click/);
assert.match(indexSource, /Right-drag/);
assert.match(indexSource, /Alt\+Shift\+M/);
assert.match(indexSource, /id="settings-menu"/);
assert.match(indexSource, /id="settings-width"/);
assert.match(indexSource, /id="reading-progress"/);
assert.match(indexSource, /id="progress-stack"/);
assert.match(indexSource, /id="speech-voice"/);
assert.match(indexSource, /id="speech-progress"/);
assert.match(indexSource, /id="speech-controls"/);
assert.match(indexSource, /id="speech-overlay-pause"/);
assert.match(indexSource, /id="speech-overlay-stop"/);
assert.match(indexSource, /id="speech-audio"[^>]*preload="auto"/);
assert.match(indexSource, /id="settings-home"[^>]*>HOME</);
assert.doesNotMatch(indexSource, /id="settings-end"/);
assert.match(indexSource, /id="settings-font-size"/);
assert.match(indexSource, /id="settings-contrast"[^>]*min="-30"[^>]*max="30"/);
assert.match(indexSource, /id="start-contrast"[^>]*min="-30"[^>]*max="30"/);
assert.match(indexSource, /id="settings-line-height"/);
assert.match(indexSource, /id="settings-speech-start"/);
assert.match(indexSource, /id="settings-speech-min"/);
assert.match(indexSource, /id="settings-speech-max"/);
assert.match(indexSource, /id="settings-speech-position"[^>]*min="5"[^>]*max="50"/);
assert.match(indexSource, /id="settings-speech-pause"/);
assert.match(indexSource, /id="settings-speech-stop"/);
assert.match(indexSource, /id="settings-toggle"[\s\S]*aria-label="Open reader settings"/);
assert.match(indexSource, /id="settings-font-size"[^>]*max="80"[^>]*step="2"/);
assert.match(indexSource, /id="settings-width"[^>]*min="8"[^>]*max="100"[^>]*step="2"/);
assert.match(indexSource, /id="start-width"[^>]*min="8"[^>]*max="100"[^>]*step="2"/);
assert.match(indexSource, /id="settings-font-size-down"/);
assert.match(indexSource, /id="settings-font-size-up"/);
for (const range of [
  "start-contrast", "start-font-size", "start-line-height", "start-width",
  "settings-contrast", "settings-font-size", "settings-line-height",
  "settings-width", "settings-speech-min", "settings-speech-max",
  "settings-speech-position"
]) {
  assert.match(indexSource, new RegExp(`id="${range}-down"`), `${range} minus`);
  assert.match(indexSource, new RegExp(`id="${range}-up"`), `${range} plus`);
}
assert.match(indexSource, /id="start-reset-all"[^>]*>RESET ALL SETTINGS</);
assert.match(indexSource, /id="settings-reset-all"[^>]*>RESET ALL SETTINGS</);
assert.match(indexSource, /styles-v36-mobile5\.css/);
assert.match(indexSource, /renderer-v36\.js\?v=20260903-controls2/);
assert.match(indexSource, /vendor\/fonts\/reader-fonts\.css\?v=20260903-fonts1/);
assert.match(rendererSource, /\/api\/piper\/prepare/);
assert.match(rendererSource, /sessionId:\s*speechSessionId/);
assert.match(rendererSource, /audioFormat:\s*speechAudioFormat/);
assert.match(rendererSource, /\/api\/piper\/stop[\s\S]*JSON\.stringify\(\{ sessionId: speechSessionId \}\)/);
assert.match(rendererSource, /BOOK_SETTINGS_PREFIX/);
assert.doesNotMatch(rendererSource, /\/api\/piper\/(?:play|pause|resume)/);
assert.match(rendererSource, /await speechAudio\.play\(\)/);
assert.match(rendererSource, /const SPEECH_SCROLL_DURATION_MS = 5/);
assert.match(rendererSource, /const eased = 1 - \(\(1 - progress\) \*\* 3\)/);
assert.doesNotMatch(rendererSource, /await animateSpeechScrollBy/);
assert.match(rendererSource, /unlockSpeechAudio\(\);\s*const generation/);
assert.match(rendererSource, /nextPreparation/);
assert.match(rendererSource, /speechProgress\.textContent = `\$\{index \+ 1\}\/\$\{jobs\.length\}`/);
assert.match(rendererSource, /speechVoice\.textContent = formatSpeechVoice\(prepared\)/);
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
assert.match(rendererSource, /addEventListener\("resize", scheduleSpeechMarkerRefresh/);
assert.match(rendererSource, /ResizeObserver\(scheduleSpeechMarkerRefresh\)/);
assert.equal((rendererSource.match(/speechPositionPercent \/ 100/g) || []).length, 2);
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
assert.match(stylesSource, /data-font="system-sans"[\s\S]*--reader-font:\s*system-ui, -apple-system, "Segoe UI", sans-serif/);
assert.match(stylesSource, /"Cascadia Mono"/);
assert.match(stylesSource, /@supports \(color: color-mix\(in srgb, white, black\)\)/);
assert.match(stylesSource, /--contrast-strength/);
assert.match(stylesSource, /--contrast-soften/);
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
assert.match(stylesSource, /safe-area-inset-bottom/);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*height:\s*100dvh/);
assert.match(stylesSource, /touch-action:\s*none/);
assert.match(stylesSource, /\(pointer:\s*coarse\)/);
assert.match(stylesSource, /#settings-toggle[^{]*\{[^}]*width:\s*52px[^}]*opacity:\s*1/s);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*#start-hotkeys[^{]*\{[^}]*font-size:\s*clamp\(1rem/s);
assert.match(stylesSource, /@media \(max-width: 620px\), \(pointer: coarse\) and \(hover: none\)[\s\S]*#settings-panel[^{]*\{[^}]*width:\s*min\(96vw, 28rem\)[^}]*font-size:\s*1rem/s);
assert.match(stylesSource, /#recent-book-list \.recent-book[^{]*\{[^}]*min-height:\s*48px/s);
assert.ok(indexSource.indexOf('id="speech-controls"') < indexSource.indexOf('id="reading-progress"'));
assert.ok(indexSource.indexOf('id="reading-progress"') < indexSource.indexOf('id="speech-progress"'));
assert.ok(indexSource.indexOf('id="speech-progress"') < indexSource.indexOf('id="speech-voice"'));
assert.match(stylesSource, /#drop-zone[^{]*\{[^}]*font-size:\s*var\(--reader-font-size\)/s);
assert.match(stylesSource, /#drop-zone[^{]*\{[^}]*position:\s*relative[^}]*place-content:\s*start center[^}]*min-height:\s*100dvh[^}]*overflow:\s*visible/s);
assert.doesNotMatch(stylesSource, /#drop-zone[^{]*\{[^}]*position:\s*fixed/s);
assert.match(stylesSource, /font-size:\s*clamp\(0\.82rem, 0\.72em, 1rem\)/);
assert.doesNotMatch(stylesSource, /html,\s*body[^}]*overflow:\s*hidden/s);
assert.match(stylesSource, /overflow:\s*visible\s*!important/);
assert.match(stylesSource, /#333d4d/i);
for (const palette of [
  "charcoal", "geany", "midnight", "sepia", "forest",
  "paper", "nord", "solarized", "gruvbox", "plum"
]) {
  assert.match(stylesSource, new RegExp(`data-palette="${palette}"`), palette);
}
assert.match(stylesSource, /data-palette="charcoal"[\s\S]*--background:\s*#121212/);
assert.match(stylesSource, /data-palette="nord"[\s\S]*--background:\s*#2e3440/);
assert.match(stylesSource, /#recent-books[^{]*\{[^}]*width:\s*min\(50rem/s);
assert.match(stylesSource, /#recent-book-list \.recent-book[^{]*\{[^}]*text-align:\s*left/s);

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
  left: speechBlockLeft,
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
vm.runInContext("setSpeechActiveJob(testSpeechJobs[1])", context);
assert.equal(selectionRanges.length, 0);
assert.equal(createdRanges.at(-1).startNode, speechNodeTwo);
assert.equal(vm.runInContext("speechScrollFrame !== null", context), true);
speechRectLeft = 160;
speechBlockLeft = 100;
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
  assert.equal(elements["#recent-books"].hidden, false);
  assert.equal(elements["#recent-book-list"].children.length, 1);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Previous Book — previous.epub"
  );
  assert.equal(elements["#recent-book-list"].children[0].disabled, false);
  assert.equal(elements["#start-reopen"].disabled, false);
  assert.equal(elements["#start-palette"].children.length, 10);
  assert.equal(elements["#start-font"].children.length, 12);
  assert.equal(elements["#start-contrast-value"].textContent, "0%");
  assert.equal(elements["#settings-contrast-value"].textContent, "0%");
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "0%");
  assert.equal(elements["#start-width-value"].textContent, "≈ 44 chars");
  assert.equal(elements["#start-font-size-value"].textContent, "36px");
  assert.equal(elements["#start-line-height-value"].textContent, "1.28");
  assert.equal(elements["#settings-speech-min-value"].textContent, "150 chars");
  assert.equal(elements["#settings-speech-max-value"].textContent, "350 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "22%");
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(vm.runInContext("speechAudioFormat", context), "opus");

  elements["#speech-audio"].autoEnd = true;
  await vm.runInContext(
    "playPreparedAudio({ audioUrl: '/api/piper/audio/test-cache-id' })",
    context
  );
  assert.equal(elements["#speech-audio"].src, "");
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

  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(pressKey("p"), true);
  assert.equal(context.document.documentElement.dataset.palette, "solarized");
  assert.equal(stored.get("smooth-reader:palette"), "solarized");

  assert.equal(pressKey("P", { shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "nord");

  assert.equal(pressKey("6", { altKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "paper");

  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(pressKey("f"), true);
  assert.equal(context.document.documentElement.dataset.font, "eb-garamond");
  const currentBookSettings = () => JSON.parse(
    [...stored.entries()].find(([key]) => key.startsWith("smooth-reader:book-settings:"))[1]
  );
  assert.equal(currentBookSettings().font, "eb-garamond");
  await wait(20);
  assert.equal(scrollByCalls.at(-1).top, 60);
  assert.equal(scrollByCalls.at(-1).behavior, "auto");

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
  assert.equal(elements["#start-width-value"].textContent, "≈ 84 chars");
  assert.equal(currentBookSettings().width, 84);

  elements["#settings-toggle"].listeners.get("click")();
  assert.equal(elements["#settings-panel"].hidden, false);
  assert.equal(elements["#settings-toggle"].getAttribute("aria-expanded"), "true");

  elements["#settings-palette"].listeners.get("change")({
    target: { value: "nord" }
  });
  assert.equal(context.document.documentElement.dataset.palette, "nord");

  elements["#start-contrast"].listeners.get("input")({ target: { value: "-15" } });
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "15%");
  assert.equal(elements["#settings-contrast-value"].textContent, "-15%");
  elements["#settings-contrast"].listeners.get("change")({ target: { value: "20" } });
  assert.equal(context.document.documentElement.style["--contrast-strength"], "20%");
  assert.equal(context.document.documentElement.style["--contrast-soften"], "0%");
  assert.equal(elements["#start-contrast-value"].textContent, "+20%");
  assert.equal(stored.get("smooth-reader:contrast"), "20");
  elements["#settings-contrast-down"].listeners.get("click")();
  assert.equal(elements["#start-contrast-value"].textContent, "+19%");
  elements["#settings-contrast-up"].listeners.get("click")();
  assert.equal(elements["#start-contrast-value"].textContent, "+20%");

  assert.equal(elements["#recent-book-list"].children[0].listeners.has("click"), true);
  assert.equal(elements["#start-open"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-start"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-pause"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-stop"].listeners.has("click"), true);
  assert.equal(elements["#speech-overlay-pause"].listeners.has("click"), true);
  assert.equal(elements["#speech-overlay-stop"].listeners.has("click"), true);
  assert.equal(elements["#settings-speech-voice"].listeners.has("change"), true);
  for (const button of [
    "#start-contrast-down", "#start-contrast-up",
    "#start-line-height-down", "#start-line-height-up",
    "#start-width-down", "#start-width-up",
    "#settings-contrast-down", "#settings-contrast-up",
    "#settings-line-height-down", "#settings-line-height-up",
    "#settings-width-down", "#settings-width-up",
    "#settings-speech-min-down", "#settings-speech-min-up",
    "#settings-speech-max-down", "#settings-speech-max-up",
    "#settings-speech-position-down", "#settings-speech-position-up",
    "#start-reset-all", "#settings-reset-all"
  ]) {
    assert.equal(elements[button].listeners.has("click"), true, button);
  }

  elements["#settings-speech-min"].listeners.get("change")({ target: { value: "400" } });
  elements["#settings-speech-max"].listeners.get("change")({ target: { value: "700" } });
  assert.equal(elements["#settings-speech-min-value"].textContent, "400 chars");
  assert.equal(elements["#settings-speech-max-value"].textContent, "700 chars");
  assert.equal(stored.get("smooth-reader:speech-minimum"), "400");
  assert.equal(stored.get("smooth-reader:speech-maximum"), "700");
  elements["#settings-speech-position"].listeners.get("input")({
    target: { value: "22" }
  });
  assert.equal(elements["#settings-speech-position-value"].textContent, "22%");
  assert.equal(stored.get("smooth-reader:speech-position"), "22");
  elements["#settings-speech-min-down"].listeners.get("click")();
  assert.equal(elements["#settings-speech-min-value"].textContent, "350 chars");
  elements["#settings-speech-min-up"].listeners.get("click")();
  assert.equal(elements["#settings-speech-min-value"].textContent, "400 chars");
  elements["#settings-speech-max-down"].listeners.get("click")();
  assert.equal(elements["#settings-speech-max-value"].textContent, "650 chars");
  elements["#settings-speech-max-up"].listeners.get("click")();
  assert.equal(elements["#settings-speech-max-value"].textContent, "700 chars");
  elements["#settings-speech-position-down"].listeners.get("click")();
  assert.equal(elements["#settings-speech-position-value"].textContent, "21%");
  elements["#settings-speech-position-up"].listeners.get("click")();
  assert.equal(elements["#settings-speech-position-value"].textContent, "22%");

  assert.equal(pressKey("r"), true);
  await wait(80);
  assert.equal(elements["#viewer"].children.length, 2);
  assert.deepEqual(renderedSections, [1, 2, 1, 2, 1, 2]);

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

  assert.equal(elements["#recent-book-list"].children.length, 3);
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
    ["third.epub", "second.epub", "test.epub"]
  );

  elements["#recent-book-list"].children[1].listeners.get("click")();
  await wait(80);
  assert.equal(
    elements["#recent-book-list"].children[0].textContent,
    "Test Book — second.epub"
  );
  assert.equal(renderedSections.length, 12);
  elements["#settings-font-size"].listeners.get("input")({ target: { value: "60" } });
  assert.equal(context.document.documentElement.style["--reader-font-size"], "60px");
  elements["#recent-book-list"].children[2].listeners.get("click")();
  await wait(80);
  assert.equal(context.document.documentElement.style["--reader-font-size"], "24px");
  assert.equal(context.document.documentElement.style["--reader-width"], "84ch");
  assert.equal(renderedSections.length, 14);

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
  assert.equal(pressKey("r"), true);
  assert.equal(renderedSections.length, 14);
  releaseSlowBook();
  await wait(100);
  assert.equal(vm.runInContext("isBookLoading", context), false);
  assert.equal(vm.runInContext("positionPersistenceSuspended", context), false);
  assert.equal(renderedSections.length, 16);

  elements["#settings-home"].listeners.get("click")();
  assert.equal(elements["#drop-zone"].hidden, false);
  assert.equal(elements["#reader"].hidden, true);
  assert.equal(elements["#settings-menu"].hidden, true);
  assert.equal(elements["#reading-progress"].hidden, true);
  assert.equal(elements["#recent-book-list"].children.length, 3);
  assert.equal(context.document.title, "Smooth Reader");

  const rememberedLastBook = stored.get("smooth-reader:last-book");
  const rememberedRecentBooks = stored.get("smooth-reader:recent-books");
  const rememberedPositions = new Map(
    [...stored.entries()].filter(([key]) => key.startsWith("smooth-reader:position:"))
  );
  elements["#start-reset-all"].listeners.get("click")();
  assert.equal(context.document.documentElement.dataset.palette, "nord");
  assert.equal(context.document.documentElement.dataset.font, "alegreya");
  assert.equal(context.document.documentElement.style["--contrast-strength"], "0%");
  assert.equal(context.document.documentElement.style["--reader-font-size"], "36px");
  assert.equal(context.document.documentElement.style["--reader-line-height"], "1.28");
  assert.equal(context.document.documentElement.style["--reader-tracking"], "0.02em");
  assert.equal(context.document.documentElement.style["--reader-width"], "44ch");
  assert.equal(elements["#settings-speech-min-value"].textContent, "150 chars");
  assert.equal(elements["#settings-speech-max-value"].textContent, "350 chars");
  assert.equal(elements["#settings-speech-position-value"].textContent, "22%");
  assert.equal(stored.get("smooth-reader:last-book"), rememberedLastBook);
  assert.equal(stored.get("smooth-reader:recent-books"), rememberedRecentBooks);
  assert.deepEqual(
    new Map([...stored.entries()].filter(([key]) => key.startsWith("smooth-reader:position:"))),
    rememberedPositions
  );
  for (const [key, value] of stored.entries()) {
    if (!key.startsWith("smooth-reader:book-settings:")) continue;
    assert.deepEqual(JSON.parse(value), {
      font: "alegreya",
      fontSize: 36,
      lineHeight: 1.28,
      tracking: 0.02,
      width: 44,
      voice: ""
    });
  }

  console.log("renderer DOM smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
