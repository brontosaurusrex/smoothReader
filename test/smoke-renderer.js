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
    listeners,
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    click() {},
    replaceChildren() {}
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
const documentListeners = new Map();
const stored = new Map();
const displayArguments = [];
const themeOverrides = [];
const scrollCalls = [];
const readingThemes = [];
let renderOptions = null;
let animationTime = 0;
let nextAnimationFrame = 1;
const animationFrames = new Map();

const flushAnimationFrames = (limit = 180) => {
  for (let frame = 0; frame < limit && animationFrames.size; frame += 1) {
    animationTime += 1000 / 60;
    const callbacks = [...animationFrames.values()];
    animationFrames.clear();
    callbacks.forEach((callback) => callback(animationTime));
  }
};

const makeRendition = () => {
  const listeners = new Map();
  return {
    themes: {
      default(theme) {
        readingThemes.push(theme);
      },
      override(...arguments_) {
        themeOverrides.push(arguments_);
      }
    },
    manager: {
      scrollBy(...arguments_) {
        scrollCalls.push(arguments_);
      }
    },
    on(name, callback) {
      listeners.set(name, callback);
    },
    async display(cfi) {
      displayArguments.push(cfi);
      listeners.get("relocated")?.({
        start: { cfi: cfi || "epubcfi(/6/2!/4/1:0)", percentage: 0.25 }
      });
    },
    destroy() {}
  };
};

const context = vm.createContext({
  console,
  Uint8Array,
  JSON,
  Date,
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
    pointerLockElement: null,
    documentElement: {
      style: {
        setProperty() {},
        removeProperty() {}
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
    addEventListener(name, callback) {
      documentListeners.set(name, callback);
    },
    exitPointerLock() {
      this.pointerLockElement = null;
      documentListeners.get("pointerlockchange")?.();
    }
  },
  window: {
    innerHeight: 800,
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback) {
      const id = nextAnimationFrame++;
      animationFrames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      animationFrames.delete(id);
    },
    addEventListener(name, callback) {
      windowListeners.set(name, callback);
    }
  },
  ePub() {
    return {
      ready: Promise.resolve(),
      spine: {
        first() {
          return { href: "chapter-one.xhtml" };
        }
      },
      loaded: {
        metadata: Promise.resolve({ title: "Test Book" })
      },
      renderTo(_target, options) {
        renderOptions = options;
        return makeRendition();
      },
      destroy() {}
    };
  }
});

elements["#viewer"].requestPointerLock = () => {
  context.document.pointerLockElement = elements["#viewer"];
  documentListeners.get("pointerlockchange")?.();
  return Promise.resolve();
};

const rendererPath = path.join(__dirname, "..", "renderer.js");
vm.runInContext(fs.readFileSync(rendererPath, "utf8"), context, {
  filename: rendererPath
});

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
  await wait(240);

  assert.equal(elements["#reader"].hidden, false);
  assert.equal(elements["#drop-zone"].hidden, true);
  assert.equal(renderOptions.manager, "continuous");
  assert.equal(renderOptions.flow, "scrolled-continuous");
  assert.equal(context.document.title, "Test Book — Smooth Reader");
  assert.equal(stored.size, 1);
  assert.match(readingThemes.at(-1).body["font-family"], /system-ui/);

  const storedPosition = JSON.parse([...stored.values()][0]);
  assert.equal(storedPosition.cfi, "epubcfi(/6/2!/4/1:0)");

  drop();
  await wait(40);
  assert.equal(displayArguments.at(-1), storedPosition.cfi);

  windowListeners.get("keydown")({
    ctrlKey: true,
    metaKey: false,
    key: "=",
    preventDefault() {}
  });
  assert.deepEqual(themeOverrides.at(-1), ["font-size", "22px", true]);

  const pointerTarget = {
    ownerDocument: context.document,
    setPointerCapture() {},
    releasePointerCapture() {}
  };

  elements["#viewer"].listeners.get("pointerdown")({
    button: 0,
    pointerId: 1,
    clientY: 100,
    target: pointerTarget,
    preventDefault() {}
  });
  assert.equal(context.document.pointerLockElement, elements["#viewer"]);

  const beforeLockedScroll = scrollCalls.length;
  documentListeners.get("mousemove")({ movementY: 10 });
  flushAnimationFrames();
  const lockedDistance = scrollCalls
    .slice(beforeLockedScroll)
    .reduce((sum, call) => sum + call[1], 0);
  assert.ok(Math.abs(lockedDistance - 20.5) < 0.01);

  const beforeReversal = scrollCalls.length;
  documentListeners.get("mousemove")({ movementY: 100 });
  documentListeners.get("mousemove")({ movementY: -10 });
  flushAnimationFrames();
  const reversedDistance = scrollCalls
    .slice(beforeReversal)
    .reduce((sum, call) => sum + call[1], 0);
  assert.ok(Math.abs(reversedDistance + 20.5) < 0.01);

  elements["#viewer"].listeners.get("pointerdown")({
    button: 0,
    pointerId: 1,
    clientY: 100,
    target: pointerTarget,
    preventDefault() {}
  });
  assert.equal(context.document.pointerLockElement, null);

  let rightClickPrevented = false;
  elements["#viewer"].listeners.get("pointerdown")({
    button: 2,
    pointerId: 2,
    clientY: 100,
    target: pointerTarget,
    preventDefault() {
      rightClickPrevented = true;
    }
  });
  assert.equal(rightClickPrevented, false);
  assert.equal(context.document.pointerLockElement, null);

  windowListeners.get("keydown")({
    ctrlKey: false,
    metaKey: false,
    key: "Home",
    preventDefault() {}
  });
  await wait(0);
  assert.equal(displayArguments.at(-1), "chapter-one.xhtml");

  const beforeWheel = scrollCalls.length;
  elements["#viewer"].listeners.get("wheel")({
    ctrlKey: false,
    metaKey: false,
    deltaMode: 0,
    deltaY: 120,
    preventDefault() {}
  });
  flushAnimationFrames();
  const wheelDistance = scrollCalls
    .slice(beforeWheel)
    .reduce((sum, call) => sum + call[1], 0);
  assert.ok(Math.abs(wheelDistance - 120) < 0.01);

  console.log("renderer smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
