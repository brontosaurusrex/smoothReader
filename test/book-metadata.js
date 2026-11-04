"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const context = vm.createContext({ console, Uint8Array, ArrayBuffer, setTimeout, clearTimeout, setImmediate });
context.window = context;
vm.runInContext(fs.readFileSync(path.join(root, "vendor/jszip.min.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "vendor/jszip-global.js"), "utf8"), context);
const source = fs.readFileSync(path.join(root, "renderer-v36.js"), "utf8");
vm.runInContext(source.slice(
  source.indexOf("const normalizedMetadataText ="),
  source.indexOf("const readingPositionForRecord =")
), context);
const api = vm.runInContext("({ extractOpfBookMetadata, extractEpubBookMetadata, publicationYearFromArchive, formatBookMetadataTitle })", context);

async function main() {
  const record = { title: "Example", author: "A. Writer", publicationYear: "2024", fileName: "short.epub" };
  assert.equal(api.formatBookMetadataTitle(record), "Example (A. Writer - 2024)");
  assert.equal(api.formatBookMetadataTitle({ ...record, publicationYear: "" }), "Example (A. Writer)");
  assert.equal(api.formatBookMetadataTitle({ ...record, author: "" }), "Example (2024)");
  assert.equal(api.formatBookMetadataTitle({ title: "Example", fileName: "short.epub" }), "Example");
  assert.equal(api.formatBookMetadataTitle({ fileName: "short.epub" }), "short.epub");
  assert.equal(api.formatBookMetadataTitle({}), "Untitled EPUB");

  const packageXml = `<package><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Example</dc:title><dc:creator>A. Writer</dc:creator>
    <meta property="dcterms:modified">2025-01-01T00:00:00Z</meta>
    </metadata><manifest>
    <item id="late" href="Text/late.xhtml" media-type="application/xhtml+xml"/>
    ${Array.from({ length: 9 }, (_, i) => `<item id="p${i}" href="Text/${i}.xhtml" media-type="application/xhtml+xml"/>`).join("")}
    </manifest><spine>${Array.from({ length: 9 }, (_, i) => `<itemref idref="p${i}"/>`).join("")}</spine></package>`;
  const metadata = api.extractOpfBookMetadata(packageXml);
  assert.equal(metadata.title, "Example");
  assert.equal(metadata.author, "A. Writer");
  assert.equal(metadata.publicationYear, ""); // Modification time is not publication time.
  const archive = new context.JSZip();
  archive.file("EPUB/Text/late.xhtml", "<p>First published in 1999</p>");
  archive.file("EPUB/Text/3.xhtml", "<p>First published in the UK in 2024 by Example Press.</p>");
  assert.equal(await api.publicationYearFromArchive(archive, "EPUB/book.opf", packageXml), "2024");
  archive.remove("EPUB/Text/3.xhtml");
  archive.file("EPUB/Text/8.xhtml", "<p>First published in 1998</p>");
  assert.equal(await api.publicationYearFromArchive(archive, "EPUB/book.opf", packageXml), "");
  archive.file("EPUB/copyright.xhtml", "<p>Copyright © 2023 Example</p>");
  const namedPackage = packageXml.replace("</manifest>", '<item id="copyright" href="copyright.xhtml" media-type="application/xhtml+xml"/></manifest>');
  assert.equal(await api.publicationYearFromArchive(archive, "EPUB/book.opf", namedPackage), "2023");
  const merged = api.extractEpubBookMetadata({}, { ...metadata, publicationYear: "2024" });
  assert.equal(api.formatBookMetadataTitle(merged), "Example (A. Writer - 2024)");

  if (process.argv[2]) {
    const realArchive = await context.JSZip.loadAsync(new Uint8Array(fs.readFileSync(process.argv[2])));
    const container = await realArchive.file("META-INF/container.xml").async("string");
    const packagePath = container.match(/full-path=["']([^"']+)/)[1];
    const realPackage = await realArchive.file(packagePath).async("string");
    const realMetadata = api.extractOpfBookMetadata(realPackage);
    realMetadata.publicationYear ||= await api.publicationYearFromArchive(realArchive, packagePath, realPackage);
    assert.equal(realMetadata.title, "Extremophile");
    assert.equal(realMetadata.author, "Ian Green");
    assert.equal(realMetadata.publicationYear, "2024");
    console.log(api.formatBookMetadataTitle(realMetadata));
  }
  console.log("Book metadata tests passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
