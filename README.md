# PDF Splitter

Splits a PDF into pieces small enough to upload to Claude. It runs entirely in
the browser — no server, no upload, no network. One self-contained
`index.html`, with [pdf-lib](https://pdf-lib.js.org) inlined.

## On an iPad

Open **https://viatekh.github.io/pdf-splitter/**, then Share → **Add to Home
Screen**. A service worker caches the app on first visit, so the Home Screen
icon works with no connection afterwards.

> **Note:** you cannot open a saved `.html` file in Safari on iPadOS. Tapping
> one in Files gives a read-only Quick Look preview where the file picker and
> downloads don't work, and there is no way to hand it to Safari. The URL above
> is the route on iOS/iPadOS; saving the file works on desktop browsers only.

To serve it yourself instead, GitHub Pages is *Settings → Pages → Deploy from a
branch → `main` → `/ (root)`*. Any static host works — the app is just files.

## On a desktop

Download `index.html` and double-click it. `file://` is fine there; the offline
caching is simply unnecessary.

## Using it

1. **Choose a PDF** — reads from Files, iCloud Drive, anywhere the picker goes.
2. Pick how to split:
   - **Size limit** (default) — measures the file with two small probe builds,
     separating what every part must carry (shared images and fonts) from the
     per-page cost, then cuts equal parts that fit. It shows the plan before
     you start: "Measured 487 KB shared by every part plus 61 KB a page, so 100
     pages fit in 25 MB — 6 parts." Defaults are 25 MB / 100 pages, just under
     Claude's 30 MB and 100-page limits.
   - **Every N pages** — equal chunks.
   - **Page ranges** — `1-10, 12, 30-` gives three parts (`30-` runs to the end).
3. **Split PDF**, then **Save** each part. Parts land in Files → Downloads,
   named `original-part1of3.pdf` and so on.

Tap the Save buttons one at a time if Safari blocks the "Save all parts" batch —
iOS limits how many downloads a page may start in a row.

### Notes

- Each page's resources are narrowed to what its own content stream uses
  before anything is copied. Many PDFs declare every image and font once, high
  in the page tree, so each page inherits the lot and a naive copy drags the
  whole pool into every part — a 35 MB manual splitting into six 35 MB parts.
  Pages holding form XObjects are left untouched, since those can draw with
  resources they do not name.
- A part that still lands over the cap is rebuilt once, smaller, and the pages
  it drops move into the next part. Anything over after that is flagged.
- Every part is reopened and page-counted after splitting; anything unreadable
  is flagged as damaged rather than handed to you silently.
- Encrypted PDFs cannot be split — pdf-lib has no decryption. A file carrying an
  encryption marker that still parses is fine and splits normally; one that is
  genuinely encrypted is rejected with instructions for making a clean copy
  (Share → Print, pinch out, Share → Save to Files).
- Everything happens in memory. Very large PDFs (hundreds of MB) can exhaust
  Safari's memory on an iPad; split those on a desktop browser.
- Splitting only runs while the page is on screen. iOS suspends a backgrounded
  tab, so switching apps pauses the work until you come back — there is no web
  API that lifts this. The app takes a screen wake lock for the duration so the
  iPad will not sleep part-way through, and says "Paused" if you do leave.

## Files

| | |
|---|---|
| `index.html` | the whole app — pdf-lib 1.17.1 (MIT) minified in `<script id="pdflib-vendor">`, the app's own plain JavaScript in the block below it |
| `sw.js` | cache-first service worker; bump `CACHE` when `index.html` changes |
| `manifest.webmanifest`, `icon-*` | Home Screen / installable-app metadata |

No build step — edit `index.html` directly.
