# PDF Splitter

A single self-contained HTML file that splits a PDF into pieces small enough to
upload to Claude. It runs entirely in the browser — no server, no network, no
upload. Works offline, including on an iPad.

## Get it onto an iPad

**Option A — save the file (fully offline)**

1. Download `index.html` (AirDrop it, email it to yourself, or save it from
   GitHub's "Download raw file" button).
2. Put it in the Files app, e.g. *On My iPad → Downloads*, and rename it
   something like `PDF Splitter.html`.
3. Tap it. It opens in Safari and works with no connection.

**Option B — GitHub Pages (tap once, add to Home Screen)**

1. In this repo: *Settings → Pages → Build from branch*, pick `main` and `/ (root)`.
2. Open `https://viatekh.github.io/pdf-splitter/` on the iPad.
3. Share → *Add to Home Screen* for an app icon. Safari caches it, so it keeps
   working offline afterwards.

## Using it

1. **Choose a PDF** — the picker reads from Files, iCloud Drive, etc.
2. Pick how to split:
   - **Size limit** (default) — packs as many pages as fit under a size cap and
     a page cap. Defaults are 25 MB / 100 pages, just under Claude's 30 MB and
     100-page limits.
   - **Every N pages** — equal chunks.
   - **Page ranges** — `1-10, 12, 30-` gives three parts (`30-` runs to the end).
3. **Split PDF**, then **Save** each part. Parts land in Files → Downloads,
   named `original-part1of3.pdf` and so on.

Tap the Save buttons one at a time if Safari blocks the "Save all parts" batch —
iOS limits how many downloads a page may start in a row.

### Notes

- The size mode binary-searches the real saved size of each chunk, so parts are
  measured, not estimated. A part can still land over the cap if one single page
  is bigger than the limit — the app flags those; compress that page first.
- Password-protected PDFs are opened where possible and written out unencrypted.
- Everything happens in memory. Very large PDFs (hundreds of MB) can exhaust
  Safari's memory on an iPad; split those on a desktop browser instead.

## Editing it

`index.html` is one file: a minified copy of
[pdf-lib](https://pdf-lib.js.org) 1.17.1 (MIT) inlined in
`<script id="pdflib-vendor">`, with the app's own plain, unminified JavaScript
in the `<script>` block right below it. Edit that block directly — no build step.
