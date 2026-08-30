"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const context = {
  console,
  Uint8Array,
  ArrayBuffer,
  TextEncoder,
  TextDecoder,
  setTimeout,
  clearTimeout,
  setImmediate,
  clearImmediate
};

context.window = context;
vm.createContext(context);

vm.runInContext(
  fs.readFileSync(path.join(root, "vendor", "jszip.min.js"), "utf8"),
  context
);
vm.runInContext(
  fs.readFileSync(path.join(root, "vendor", "jszip-global.js"), "utf8"),
  context
);

assert.equal(typeof context.JSZip, "function");

const fixture = fs.readFileSync(path.join(__dirname, "fixtures", "tiny.epub"));

context.JSZip.loadAsync(new Uint8Array(fixture)).then((archive) => {
  const files = Object.keys(archive.files);
  assert.ok(files.includes("mimetype"));
  assert.ok(files.includes("META-INF/container.xml"));
  assert.ok(files.includes("EPUB/package.opf"));
  console.log("vendored JSZip opened a real EPUB archive");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
