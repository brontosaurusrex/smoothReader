"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createHash } = require("node:crypto");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "renderer-v36.js"), "utf8");

async function main() {
  const values = new Map(), remote = new Map(), uploads = [];
  const c = vm.createContext({ console: { log: console.log, error() {} }, Uint8Array, ArrayBuffer, setTimeout, clearTimeout, setImmediate,
    LIBRARY_BACKUP_FORMAT: "smooth-reader-library", LIBRARY_BACKUP_VERSION: 1,
    MAX_RECENT_BOOKS: 12, MAX_LIBRARY_IMPORT_BYTES: 512 * 1024 * 1024,
    SERVER_LIBRARY_UPLOAD_TIMEOUT_MS: 100, RECENT_BOOKS_KEY: "smooth-reader:recent",
    LAST_BOOK_KEY: "smooth-reader:last", POSITION_PREFIX: "smooth-reader:position:",
    BOOK_SETTINGS_PREFIX: "smooth-reader:settings:",
    cachedRecentBooks: [], recentBookInfo: [], serverBookInfo: [], serverBookHashes: new Set(),
    serverLibraryBusy: false, isBookLoading: false, activeBookKey: null,
    recentBooksReady: Promise.resolve(), connected: true,
    localStorage: {
      get length() { return values.size; }, key: i => [...values.keys()][i],
      getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k)
    },
    positionKey: h => `smooth-reader:position:${h}`, bookSettingsKey: h => `smooth-reader:settings:${h}`,
    booksMatch: (a,b) => a.hash === b.hash,
    hashBook: async bytes => createHash("sha256").update(new Uint8Array(bytes)).digest("hex"),
    showStatus: message => { c.message = message; }, renderRecentBooks() {}, applyImportedSettings() {},
    writeCachedBooks: async () => true,
    refreshServerLibrary: async () => {
      if (!c.connected) return false;
      c.serverBookInfo = [...remote.values()]; c.serverBookHashes = new Set(remote.keys()); return true;
    },
    storeBookOnServer: async record => { uploads.push(record.hash); remote.set(record.hash, record); },
    serverRequest: async (url, options) => {
      if (c.failRequest) throw new Error("Server failed");
      if (url === "/api/library/status") return { maxBookBytes: 256 * 1024 * 1024 };
      const hash = url.split("/")[4];
      if (url.endsWith("/state")) return { state: { hash, position: { ratio: .7, savedAt: 20 }, settings: { font: "lora", savedAt: 20 } } };
      assert.equal(options.expectBinary, true);
      return remote.get(hash).bytes;
    }
  });
  c.window = c;
  for (const file of ["jszip.min.js", "jszip-global.js"]) vm.runInContext(fs.readFileSync(path.join(root, "vendor", file), "utf8"), c);
  for (const [start,end] of [
    ["const storageSnapshot =", "const importedRecentMetadata ="],
    ["const buildLibraryBackup =", "const exportLibrary ="],
    ["const importLibrary =", "const setSettingsOpen ="]
  ]) vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)), c);
  const backup = complete => vm.runInContext(`buildLibraryBackup(${complete})`, c);
  const restore = bytes => { c.input = bytes; return vm.runInContext("importLibrary({arrayBuffer:async()=>input})", c); };
  for (let i = 0; i < 14; i++) {
    const bytes = new Uint8Array([i]).buffer;
    const hash = await c.hashBook(bytes);
    remote.set(hash, { hash, title: `Book ${i}`, fileName: `${i}.epub`, openedAt: i, bytes });
  }
  c.cachedRecentBooks = [...remote.values()].slice(0,12);
  const first = c.cachedRecentBooks[0];
  values.set(c.positionKey(first.hash), JSON.stringify({ ratio: .9, savedAt: 30 }));
  let full = await backup(true);
  assert.equal(full.manifest.books.length,14, "Deduplicate books present in both stores");
  assert.equal(JSON.parse(full.manifest.localStorage[c.positionKey(first.hash)]).ratio,.9, "Newer local state wins");
  const only = [...remote.values()][13];
  assert.equal(JSON.parse(full.manifest.localStorage[c.positionKey(only.hash)]).ratio,.7);
  assert.equal(full.manifest.scope,"complete");
  const zip = await full.archive.generateAsync({type:"uint8array"});
  remote.clear(); c.cachedRecentBooks=[]; c.recentBookInfo=[];
  await restore(zip);
  assert.equal(uploads.length,14); assert.equal(remote.size,14);
  assert.equal(c.cachedRecentBooks.length,12);
  assert.equal(remote.get(only.hash).title,"Book 13", "Metadata survives browser cache eviction");
  assert.equal(c.serverLibraryBusy,false);
  c.failRequest=true;
  await assert.rejects(backup(true), /Server failed/);
  c.failRequest=false; c.connected=false;
  await assert.rejects(backup(true), /Server unavailable/);
  const local = await backup(false);
  assert.equal(local.manifest.scope,"browser-only"); assert.equal(local.manifest.books.length,12);
  await restore(zip);
  assert.match(c.message,/12 \/ 14 BOOKS IMPORTED/);
  const legacy = new c.JSZip();
  legacy.file("one.epub", first.bytes);
  legacy.file("manifest.json",JSON.stringify({format:c.LIBRARY_BACKUP_FORMAT,version:1,books:[{...first,bytes:undefined,epubPath:"one.epub"}],localStorage:{}}));
  await restore(await legacy.generateAsync({type:"uint8array"}));
  assert.match(c.message,/LIBRARY IMPORTED/);
  c.connected=true; c.failRequest=true;
  await restore(zip);
  assert.match(c.message,/IMPORT STOPPED/);
  assert.equal(c.serverLibraryBusy,false);
  console.log("Full-library backup and restore tests passed");
}
main().catch(error => { console.error(error); process.exitCode=1; });
