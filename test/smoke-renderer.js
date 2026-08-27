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
let renderOptions = null;

const makeRendition = () => {
  const listeners = new Map();
  return {
    themes: {
      default() {},
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
    setTimeout,
    clearTimeout,
    addEventListener(name, callback) {
      windowListeners.set(name, callback);
    }
  },
  ePub() {
    return {
      ready: Promise.resolve(),
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

  documentListeners.get("mousemove")({ movementY: 10 });
  assert.deepEqual(scrollCalls.at(-1), [0, 22, false]);

  elements["#viewer"].listeners.get("pointerdown")({
    button: 0,
    pointerId: 1,
    clientY: 100,
    target: pointerTarget,
    preventDefault() {}
  });
  assert.equal(context.document.pointerLockElement, null);

  elements["#viewer"].listeners.get("pointerdown")({
    button: 2,
    pointerId: 2,
    clientY: 100,
    target: pointerTarget,
    preventDefault() {},
    stopPropagation() {}
  });
  elements["#viewer"].listeners.get("pointermove")({
    pointerId: 2,
    buttons: 2,
    clientY: 90,
    preventDefault() {}
  });
  assert.deepEqual(scrollCalls.at(-1), [0, 16, false]);

  console.log("renderer smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
