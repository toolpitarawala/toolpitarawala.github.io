# ToolPitara — site source

Free online tools, India-first, built as a **plain static site**: HTML, CSS and vanilla
JavaScript only. No build step, no server, no frameworks, no external/CDN dependencies —
every asset is served from this folder. All calculators run entirely in the visitor's
browser; nothing a visitor types is sent anywhere or stored.

Live address (once deployed): https://toolpitarawala.github.io/

## Folder structure

```
site/
├── index.html                  Homepage: hero, working tool search, category cards
├── about.html                  About Us
├── contact.html                Contact Us (email only — no form, by design)
├── privacy.html                Privacy Policy (matches the implementation exactly)
├── terms.html                  Terms & Conditions
├── disclaimer.html             Disclaimer
├── robots.txt                  Allows all crawlers; points to the sitemap
├── sitemap.xml                 Homepage + 4 tools + 5 trust pages
├── README.md                   This file
├── assets/
│   ├── style.css               Shared stylesheet (light + dark themes, CSS variables)
│   ├── app.js                  Theme toggle (localStorage "tp-theme") + homepage search filter
│   ├── emi.js                  EMI maths — pure functions, Node-testable
│   ├── sip.js                  SIP maths — pure functions, Node-testable
│   ├── gst.js                  GST maths — pure functions, Node-testable
│   └── resizer.js              Resizer core (crop fit, KB quality search) — pure, Node-testable
└── tools/
    ├── emi-calculator.html     EMI Calculator (+ amortisation table, donut chart)
    ├── sip-calculator.html     SIP Calculator (+ year-wise growth chart)
    ├── gst-calculator.html     GST Calculator (add/remove, CGST/SGST/IGST split)
    └── photo-signature-resizer.html  Photo & Signature Resizer (exact px + KB, exam presets)
```

Tools planned but NOT yet built appear on the homepage as unlinked "Coming soon" cards
(PDF Merger, CGPA Converter, QR Code Generator). No fake buttons.

## Preview locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ in a browser. (Opening the files directly with file://
also mostly works, but the local server is the faithful preview.)

## Test the calculator maths

The maths in `assets/emi.js`, `assets/sip.js` and `assets/gst.js` — and the crop/quality
logic in `assets/resizer.js` — is written as pure
functions with a Node export, so it can be verified outside the browser, e.g.:

```bash
node -e "const E=require('./assets/emi.js'); console.log(E.amortisation(500000,9,60).emi)"
# → 10379.1776…  (₹5,00,000 at 9% for 5 years ⇒ EMI ₹10,379)
```

## Deploying to GitHub Pages (later — instructions only)

1. Create a GitHub account (username `toolpitara` so the address matches).
2. Create a **public** repository named exactly `toolpitarawala.github.io`.
3. Upload/push the contents of this `site/` folder to the repository root
   (`index.html` must sit at the root, not inside a subfolder).
4. In the repository: **Settings → Pages** — set Source to "Deploy from a branch",
   branch `main`, folder `/ (root)`. Save.
5. Wait a few minutes, then visit https://toolpitarawala.github.io/ and check every page,
   the theme toggle, all three calculators, the photo & signature resizer and the sitemap at
   https://toolpitarawala.github.io/sitemap.xml .
6. After it is live, submit the sitemap in Google Search Console.

Notes:
- The canonical/OG URLs and sitemap already use `https://toolpitarawala.github.io`, so no
  URL edits are needed at deploy time.
- Nothing about deployment changes the privacy behaviour: GitHub Pages serves static
  files only, and the calculators still run purely in the visitor's browser.
