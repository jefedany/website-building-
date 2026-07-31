#!/usr/bin/env python3
"""
build_embed.py — regenerate the GoHighLevel paste kit in ./embed/ from the
readable source of truth (index.html + styles.css + script.js).

Output = the repo's CHARSET-PROOF format (verified byte-for-byte against the
committed embed files, 2026-07-30):
  * HTML content  -> non-ASCII becomes numeric entities (&#8212; etc.)
  * inlined JS     -> non-ASCII becomes \\uXXXX escapes
  * CSS            -> typographic chars mapped to ASCII (see _CSS_ASCII)
  * 2-html-and-js.html is re-emitted in the TextEdit/Cocoa <p>/<span> export
    format (open in TextEdit, select-all/copy yields the raw charset-proof code)

Transforms: strip the <head>/doctype wrapper, move the JSON-LD schema to the
top, rewrite images/<file> -> the jsDelivr CDN, inline script.js (IMG_BASE ->
CDN), and drop the site's <script src="script.js"> ref.

The GHL AI chat-widget loader is EXCLUDED by default (it's configured natively
in GHL; bundling it would double-load). Pass --with-chat to include it (that's
how the pre-2026-07-30 committed embeds were built).

Run:  python3 build_embed.py            # -> ./embed, no chat widget
      python3 build_embed.py SRC OUT    # explicit dirs
      python3 build_embed.py . out --with-chat
"""
import os, re, sys, html

args = [a for a in sys.argv[1:] if not a.startswith("--")]
SRC = os.path.abspath(args[0]) if len(args) > 0 else os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(args[1]) if len(args) > 1 else os.path.join(SRC, "embed")
INCLUDE_CHAT = "--with-chat" in sys.argv

CDN = "https://cdn.jsdelivr.net/gh/jefedany/website-building-@main/images/"
FONTS = ("@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600"
         "&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');")

def read(n): return open(os.path.join(SRC, n), encoding="utf-8").read()
def cdnify(s): return s.replace("images/", CDN)
def ent(s):  return s.encode("ascii", "xmlcharrefreplace").decode()   # HTML -> &#NNNN;
def ju(s):   return s.encode("ascii", "backslashreplace").decode()    # JS   -> \uXXXX

index = read("index.html"); css = read("styles.css"); js = read("script.js")

# CSS can't use HTML entities, so map typographic chars (found only in comments) to ASCII.
_CSS_ASCII = {0x2014:"-", 0x2013:"-", 0x2212:"-", 0x2192:"->", 0x2190:"<-",
              0x2022:"*", 0x00b7:"*", 0x00d7:"x", 0x00a9:"(c)",
              0x2018:"'", 0x2019:"'", 0x201c:'"', 0x201d:'"', 0x2026:"..."}
css_ascii = css.translate(_CSS_ASCII)
if not css_ascii.isascii():
    bad = sorted({hex(ord(c)) for c in css_ascii if ord(c) > 127})
    sys.exit("ERROR: styles.css has non-ASCII not covered by _CSS_ASCII: " + ", ".join(bad))

schema = ent(cdnify(re.search(r'<script type="application/ld\+json">.*?</script>', index, re.S).group(0)))
body_full = re.search(r"<body>(.*)</body>", index, re.S).group(1)
chat = re.search(r"<!--[^\n]*AI CHAT WIDGET.*?</script>", body_full, re.S)
chat_block = chat.group(0) if chat else ""
body = body_full
if chat: body = body.replace("\n" + chat_block, "").replace(chat_block, "")
body = re.sub(r'\n\s*<script src="script\.js"></script>', "", body)
body_html = ent(cdnify(body).strip())
script_block = "<script>\n" + ju(cdnify(js)).strip() + "\n</script>"
chat_html = ent(chat_block.strip())

# ---- header comments (verbatim from the committed kit; ASCII hyphens) ----
C_PAGE = ("<!-- AGUILA CONSTRUCTION - paste into a GHL Custom JS/HTML (Custom Code) element.\n"
          "     Pair with the CSS block in Page Settings -> Custom CSS.\n"
          "     Images load from your public repo via jsDelivr:\n"
          "       " + CDN + "\n"
          "     To add gallery jobs, edit the GALLERY list in the <script> below. -->")
C_ONEPASTE = ("<!-- AGUILA CONSTRUCTION - paste into a GHL ONE-PASTE (CSS+HTML+JS). Blank page ->\n"
              "     section padding 0 / full width -> Custom JS/HTML element -> paste all.\n"
              "     Pair with the CSS block in Page Settings -> Custom CSS.\n"
              "     Images load from your public repo via jsDelivr:\n"
              "       " + CDN + "\n"
              "     To add gallery jobs, edit the GALLERY list in the <script> below. -->")
C_CSS = "/* AGUILA CONSTRUCTION - paste into GHL: Page Settings (gear) -> Custom CSS */"

def combined(with_style, with_js):
    if with_style:
        header = C_ONEPASTE + "\n<style>\n" + FONTS + "\n" + css_ascii.strip() + "\n</style>"
    else:
        header = C_PAGE
    blocks = [header, schema, body_html]
    if with_js: blocks.append(script_block)
    if INCLUDE_CHAT and chat_html: blocks.append(chat_html)
    return "\n\n".join(blocks) + "\n"

def cocoa(text):
    HEAD=('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n'
          '<html>\n<head>\n  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n'
          '  <meta http-equiv="Content-Style-Type" content="text/css">\n  <title></title>\n'
          '  <meta name="Generator" content="Cocoa HTML Writer">\n  <meta name="CocoaVersion" content="2685.6">\n'
          '  <style type="text/css">\n'
          '    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times; color: #0000e9; -webkit-text-stroke: #0000e9; min-height: 14.0px}\n'
          '    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Times; color: #0000e9; -webkit-text-stroke: #0000e9}\n'
          '    span.s1 {font-kerning: none}\n  </style>\n</head>\n<body>\n')
    def escp(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    def encline(src):
        if src == "": return '<p class="p1"><span class="s1"></span><br></p>'
        buf = ""
        for p in re.split(r"( {2,})", src):
            if p and p[0] == " " and len(p) >= 2:
                buf += '<span class="Apple-converted-space">' + p + '</span>'
            else:
                buf += escp(p)
        return '<p class="p2"><span class="s1">' + buf + '</span></p>'
    return HEAD + "\n".join(encline(l) for l in text.split("\n")) + "\n</body>\n</html>\n"

files = {
    "1-styles.css": C_CSS + "\n" + FONTS + "\n\n" + css_ascii.strip() + "\n",
    "2-page.html": combined(with_style=False, with_js=True),
    "3-scripts.html": script_block + "\n",
    "aguila-ghl-onepaste.html": combined(with_style=True, with_js=True),
    "2-html-and-js.html": cocoa(combined(with_style=False, with_js=True)),
}

# ---- sanity checks ----
problems = []
for name, text in files.items():
    if not text.isascii():
        problems.append(f"{name}: output is not pure ASCII (charset-proofing failed)")
    if "images/" in text.replace(CDN, ""):
        problems.append(f"{name}: a relative images/ path survived cdnify()")
    if INCLUDE_CHAT is False and "widgets.leadconnectorhq" in text:
        problems.append(f"{name}: chat widget present but should be excluded")
if "faq-trigger" not in files["2-page.html"] or "aria-expanded" not in files["2-page.html"]:
    problems.append("2-page.html: accessible FAQ markup missing")
if 'IMG_BASE = "' + CDN not in files["3-scripts.html"]:
    problems.append("3-scripts.html: IMG_BASE not pointed at the CDN")
# 2-html-and-js.html must decode (copy-all) back to the plain combined content
_plain = combined(with_style=False, with_js=True)
_body = re.search(r"<body>\n(.*)\n</body>", files["2-html-and-js.html"], re.S).group(1)
def _dec(p):
    if p == '<p class="p1"><span class="s1"></span><br></p>': return ""
    inner = re.match(r'<p class="p2"><span class="s1">(.*)</span></p>$', p).group(1)
    inner = re.sub(r'<span class="Apple-converted-space">( +)</span>', lambda z: z.group(1), inner)
    return html.unescape(inner)
if "\n".join(_dec(l) for l in _body.split("\n")) != _plain:
    problems.append("2-html-and-js.html: Cocoa copy-all does not round-trip to the source code")
if problems:
    sys.exit("BUILD ABORTED:\n  - " + "\n  - ".join(problems))

os.makedirs(OUT, exist_ok=True)
for name, text in files.items():
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(text)
    print(f"wrote {os.path.relpath(os.path.join(OUT, name), SRC)}  ({len(text):,} bytes)")
print("OK — charset-proof, chat widget %s, all sanity checks passed."
      % ("INCLUDED" if INCLUDE_CHAT else "excluded"))
