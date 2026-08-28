"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const makeElement = () => {
  const listeners = new Map();
  return {
    hidden: false,
    textContent: "",
    value: "",
    files: null,
    className: "",
    dataset: {},
    children: [],
    listeners,
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
    querySelectorAll() {
      return [];
    },
    scrollIntoView(options) {
      this.lastScrollIntoView = options;
    },
    click() {}
  };
};

const elements = {
  "#drop-zone": makeElement(),
  "#reader": makeElement(),
  "#viewer": makeElement(),
  "#drag-cover": makeElement(),
  "#status": makeElement(),
  "#file-input": makeElement()
};

elements["#reader"].hidden = true;
elements["#drag-cover"].hidden = true;
elements["#status"].hidden = true;

const windowListeners = new Map();
const stored = new Map();
const scrollCalls = [];
const scrollByCalls = [];
const renderedSections = [];
let unloadedSections = 0;

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
      async digest() {
        return new Uint8Array(32).buffer;
      }
    }
  },
  localStorage: {
    getItem(key) {
      return stored.get(key) ?? null;
    },
    setItem(key, value) {
      stored.set(key, value);
    }
  },
  document: {
    title: "Smooth Reader",
    fonts: { ready: Promise.resolve() },
    documentElement: { scrollHeight: 3000, dataset: {} },
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
    }
  },
  window: {
    innerHeight: 800,
    scrollY: 0,
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback) {
      return setTimeout(() => callback(Date.now()), 0);
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

const rendererPath = path.join(__dirname, "..", "renderer-v7.js");
vm.runInContext(fs.readFileSync(rendererPath, "utf8"), context, {
  filename: rendererPath
});

const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(__dirname, "..", "styles-v7.css"), "utf8");
assert.match(indexSource, /styles-v7\.css/);
assert.match(indexSource, /renderer-v7\.js/);
assert.doesNotMatch(stylesSource, /overflow:\s*hidden/);
assert.match(stylesSource, /overflow:\s*visible\s*!important/);
assert.match(stylesSource, /#333d4d/i);

const file = {
  name: "test.epub",
  async arrayBuffer() {
    return new Uint8Array([1, 2, 3, 4]).buffer;
  }
};

const drop = () => windowListeners.get("drop")({
  preventDefault() {},
  dataTransfer: { files: [file] }
});

(async () => {
  drop();
  await wait(80);

  assert.equal(elements["#reader"].hidden, false);
  assert.equal(elements["#drop-zone"].hidden, true);
  assert.equal(elements["#viewer"].children.length, 2);
  assert.deepEqual(renderedSections, [1, 2]);
  assert.equal(unloadedSections, 2);
  assert.equal(context.document.title, "Test Book — Smooth Reader");

  assert.equal(elements["#viewer"].listeners.has("wheel"), false);
  assert.equal(elements["#viewer"].listeners.has("pointerdown"), false);
  assert.equal(windowListeners.has("keydown"), true);

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
  assert.equal(pressKey("Home"), true);
  assert.equal(scrollCalls.at(-1), 0);

  assert.equal(pressKey("End"), true);
  assert.equal(scrollCalls.at(-1), 3000);

  assert.equal(pressKey("PageDown"), true);
  assert.equal(scrollByCalls.at(-1).top, 704);
  assert.equal(scrollByCalls.at(-1).behavior, "smooth");

  assert.equal(pressKey("PageUp"), true);
  assert.equal(scrollByCalls.at(-1).top, -704);

  assert.equal(context.document.documentElement.dataset.palette, "charcoal");
  assert.equal(pressKey("p"), true);
  assert.equal(context.document.documentElement.dataset.palette, "geany");
  assert.equal(stored.get("smooth-reader:palette"), "geany");

  assert.equal(pressKey("P", { shiftKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "charcoal");

  assert.equal(pressKey("6", { altKey: true }), true);
  assert.equal(context.document.documentElement.dataset.palette, "paper");

  console.log("renderer DOM smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
