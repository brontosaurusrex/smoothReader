"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "renderer-v36.js"), "utf8");

function fixture() {
  const calls = [], messages = [], storage = new Map(), remote = new Map();
  const a = { hash: "a".repeat(64), fileName: "a.epub", bytes: new Uint8Array([1]) };
  const b = { hash: "b".repeat(64), fileName: "b.epub", bytes: new Uint8Array([2]) };
  const c = vm.createContext({
    console: { error() {}, warn() {} }, window: { confirm: () => true, clearTimeout() {} },
    isBookLoading: false, serverLibraryBusy: false, serverLibraryAvailable: true,
    removingBookHashes: new Set(), serverStateSyncTimers: new Map(), serverStateSyncing: new Map(),
    selectedLibraryBooks: new Set(), serverBookHashes: new Set(), serverBookInfo: [],
    cachedRecentBooks: [a, b], recentBookInfo: [a, b], activeBookKey: null,
    activeBookTitle: "", readerScrollBeforeHome: 0, lastBookCanReopen: true,
    RECENT_BOOKS_KEY: "recent", LAST_BOOK_KEY: "last", SERVER_LIBRARY_UPLOAD_TIMEOUT_MS: 100,
    recentBooksReady: Promise.resolve(),
    localStorage: { setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) },
    positionKey: hash => `position:${hash}`, bookSettingsKey: hash => `settings:${hash}`,
    booksMatch: (x,y) => x.hash === y.hash,
    libraryBookKey: r => `hash:${r.hash}`,
    displayedLibraryBooks: () => [...new Map([...c.serverBookInfo, ...c.recentBookInfo].map(r=>[r.hash,r])).values()],
    writeCachedBooks: async records => { c.persistedCache = records; return true; },
    renderRecentBooks() {}, setReopenAvailability() {}, replaceHomeHistory() {},
    destroyCurrentBook() { storage.set(`position:${c.activeBookKey}`, "saved during teardown"); },
    setLibraryManageMode(value) { if (!value) c.selectedLibraryBooks.clear(); },
    showStatus: value => messages.push(value),
    jpegBytesFromDataUrl: () => null,
    bookMetadataOnly: ({ bytes, ...record }) => record,
    serverStateForBook: hash => ({ hash }),
    refreshServerLibrary: async () => {
      if (!c.serverLibraryAvailable) return false;
      c.serverBookInfo = [...remote.values()];
      c.serverBookHashes = new Set(remote.keys());
      return true;
    },
    serverRequest: async (url, options) => {
      calls.push([url, options.method]);
      if (c.failRequest?.(url, options)) throw new Error("Connection failed");
      const hash = url.split("/")[4];
      if (options.method === "DELETE") remote.delete(hash);
      if (url.endsWith("/epub")) remote.set(hash, { hash, fileName: `${hash[0]}.epub` });
      return {};
    }
  });
  for (const [start, end] of [["const removeSelectedBooks =", "const populateSelect ="], ["const autoStoreBooksOnServer =", "const hashBook ="]]) {
    vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end)), c);
  }
  return { c, a, b, calls, messages, storage, remote,
    upload: records => { c.records = records; return vm.runInContext("autoStoreBooksOnServer(records)", c); },
    remove: () => vm.runInContext("removeSelectedBooks()", c)
  };
}

async function main() {
  {
    const f = fixture();
    await f.upload([f.a,f.b]);
    assert.equal(f.remote.size, 2);
    assert.equal(f.calls.filter(([url])=>url.endsWith("/epub")).length, 2);
    await f.upload([f.a]);
    assert.equal(f.calls.filter(([url])=>url.endsWith("/epub")).length, 2, "Existing EPUBs are not uploaded again");
    assert.equal(f.c.serverLibraryBusy, false);
  }
  {
    const f = fixture(); f.c.serverLibraryAvailable = false;
    await f.upload([f.a]);
    assert.equal(f.calls.length, 0);
    assert.equal(f.c.cachedRecentBooks.length, 2);
    assert.equal(f.c.serverLibraryBusy, false);
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    await f.remove();
    assert.equal(f.c.cachedRecentBooks.length, 1, "Offline local-only removal works");
  }
  {
    const f = fixture(); f.c.failRequest = () => true;
    await f.upload([f.a]);
    assert.equal(f.c.cachedRecentBooks.length, 2);
    assert.match(f.messages.at(-1), /BROWSER COPY KEPT/);
  }
  {
    const f = fixture(); await f.upload([f.a]);
    f.c.activeBookKey = f.a.hash;
    f.storage.set(`settings:${f.a.hash}`, "{}");
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    let finishSync;
    f.c.serverStateSyncing.set(f.a.hash, new Promise(r=>{ finishSync=r; }));
    const removal = f.remove();
    await Promise.resolve();
    assert.equal(f.calls.some(([,method])=>method === "DELETE"), false, "Wait for pending state writes before deletion");
    finishSync(); await removal;
    assert.equal(f.remote.size, 0);
    assert.equal(f.c.cachedRecentBooks.length, 1);
    assert.equal(f.c.recentBookInfo.length, 1);
    assert.equal(f.c.activeBookKey, null);
    assert.equal(f.storage.has(`position:${f.a.hash}`), false);
    assert.equal(f.storage.has(`settings:${f.a.hash}`), false);
    assert.equal(f.c.removingBookHashes.size, 0);
  }
  for (const unavailable of [false,true]) {
    const f = fixture(); await f.upload([f.a]);
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    f.c.failRequest = () => true;
    f.c.serverLibraryAvailable = !unavailable;
    await f.remove();
    assert.equal(f.remote.size, 1);
    assert.equal(f.c.cachedRecentBooks.length, 2, "Retain browser copy when server deletion fails");
    assert.equal(f.c.selectedLibraryBooks.size, 1);
    assert.match(f.messages.at(-1), /REMOVED 0 \/ 1/);
    assert.equal(f.c.serverLibraryBusy, false);
  }
  {
    const f = fixture(); await f.upload([f.a]);
    f.c.cachedRecentBooks = []; f.c.recentBookInfo = [];
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    await f.remove(); assert.equal(f.remote.size, 0, "Server-only books can be removed");
  }
  {
    const f = fixture(); await f.upload([f.a, f.b]);
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    f.c.selectedLibraryBooks.add(`hash:${f.b.hash}`);
    f.c.failRequest = url => url.endsWith(f.b.hash);
    await f.remove();
    assert.equal(f.c.cachedRecentBooks.length, 1);
    assert.equal(f.c.cachedRecentBooks[0].hash, f.b.hash);
    assert.equal(f.remote.size, 1);
    assert.equal(f.c.selectedLibraryBooks.size, 1);
    assert.match(f.messages.at(-1), /REMOVED 1 \/ 2/);
  }
  {
    const f = fixture(); f.c.window.confirm = () => false;
    f.c.selectedLibraryBooks.add(`hash:${f.a.hash}`);
    await f.remove(); assert.equal(f.c.cachedRecentBooks.length, 2);
  }
  console.log("Automatic storage and unified removal tests passed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
