AGUILA CONSTRUCTION — GoHighLevel paste kit
===========================================

PASTE OPTIONS
=============
OPTION A — ONE PASTE (recommended):  aguila-ghl-onepaste.html
  1. GHL -> blank page -> add a section -> padding 0, width Full.
  2. Drag in a "Custom JS/HTML" (Custom Code) element.
  3. Paste the ENTIRE file. Save/Publish.

OPTION B — THREE BLOCKS:
  1-styles.css    -> Page Settings (gear) -> Custom CSS
  2-page.html     -> a Custom JS/HTML element on the page
  3-scripts.html  -> Page Settings -> Tracking Code -> BODY


!!! IMAGES — READ THIS (repo is private) !!!
============================================
Image URLs point to your repo via the jsDelivr CDN:
   https://cdn.jsdelivr.net/gh/jefedany/website-building-@main/images/<file>

jsDelivr ONLY serves PUBLIC repos. Your repo is private, so right now
these images will NOT load. Pick ONE fix:

  A) Make a SEPARATE public repo just for images (keeps your code private):
       - New public repo, e.g.  aguila-assets
       - Put the /images folder in it, commit/push.
       - Find/replace in the pasted code:
             jefedany/website-building-@main
         with:
             jefedany/aguila-assets@main
  B) Make THIS repo public (simplest; static site has no secrets).
  C) Use GHL Media Library: upload each image, then paste each image's
     GHL URL in place of its CDN URL (more manual — 16 files).

After pushing new images to GitHub, jsDelivr may cache for a few hours.
To force-refresh a file immediately, visit once:
   https://purge.jsdelivr.net/gh/jefedany/website-building-@main/images/<file>


HOW TO ADD JOBS TO THE GALLERY  (the part you'll do often)
=========================================================
Everything is driven by one list called GALLERY inside the JS
(in 3-scripts.html, or the <script> near the bottom of the one-paste file,
or just edit the Custom Code element right inside GHL).

1. Upload the new photo(s) to your images repo (same place as the rest).
   Tip: keep them ~1600px and under ~500KB so the page stays fast.

2. Find the right category (bathrooms / basements / kitchens) and add a
   line to its  photos: [ ... ]  list.

   ONE photo:
       { src: "basement-job7.jpg", cap: "Finished basement — St. Charles" },

   BEFORE / AFTER (renders as a drag slider automatically):
       { before: "bath-job7-before.jpg", after: "bath-job7-after.jpg", cap: "Master bath remodel — Elgin" },

3. Save. The card's "X photos" count and the gallery update automatically.

ADD A WHOLE NEW CATEGORY (e.g. Decks): copy one { id:..., label:..., blurb:...,
cover:"file.jpg", photos:[...] } block in GALLERY and change the values.
A new project card appears on its own — no other edits needed.

(File names only — no "images/" prefix. The IMG_BASE line at the top of the
 list adds the folder/URL for you, so you only change it in one place.)


FORM
====
The "Free Quote" buttons open your GoHighLevel form (id dO854gO373nh0asaKRec)
in a branded popup. Style the form INSIDE GoHighLevel — it updates here
automatically (same form id).

SEO
===
Set page title / meta description / social image in GHL's page SEO settings.
(Structured data is already included in the HTML.)
