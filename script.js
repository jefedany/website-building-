/* ============================================================
   Aguila Construction — site interactivity
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- sticky header shadow ---------- */
  var header = $(".site-header");
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var burger = $("#hamburger");
  var nav = $("#nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$("#nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- FAQ: single-open accordion (button + aria) ---------- */
  var faqTriggers = $$(".faq-trigger");
  var setFaq = function (btn, open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (panel) panel.hidden = !open;
    var item = btn.closest(".faq-item");
    if (item) item.classList.toggle("open", open);
  };
  faqTriggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      faqTriggers.forEach(function (other) { setFaq(other, false); });
      if (!isOpen) setFaq(btn, true);
    });
  });

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ============================================================
     JOBS GALLERY  —  EDIT THIS LIST TO ADD WORK
     ------------------------------------------------------------
     IMG_BASE = where the photos live (just the folder).
     Each category has: label, blurb, cover (the card photo), photos[].
     A photo is one of:
        { src: "file.jpg", cap: "Caption" }                          // single photo
        { before: "x-before.jpg", after: "x-after.jpg", cap: "..." } // before/after slider
     To add a job: upload the photo(s), then add a line to the right
     category's photos[]. To add a whole new category, copy a block.
     ============================================================ */
  var IMG_BASE = "images/";
  var imgURL = function (file) {
    return /^(https?:|data:|\/)/.test(file) ? file : IMG_BASE + file;
  };

  var GALLERY = [
    {
      id: "bathrooms",
      label: "Bathrooms",
      blurb: "Tub-to-shower conversions, fresh tile, vanities, and full bath remodels — done right.",
      cover: "bath-after.jpg",
      photos: [
        { before: "bath-before.jpg", after: "bath-after.jpg", cap: "Tub-to-shower remodel — Elgin, IL" },
        { src: "bathroom-after.jpg", cap: "Tiled walk-in shower with new glass doors" },
        { before: "bath-floor-before.jpg", after: "bath-floor-after.jpg", cap: "New hex marble tile floor" }
      ]
    },
    {
      id: "basements",
      label: "Basements",
      blurb: "Cold concrete turned into a warm, finished living space your family will actually use.",
      cover: "basement-after.jpg",
      photos: [
        { src: "basement-after.jpg", cap: "Finished basement — bright, warm living space" },
        { src: "basement-before-4.jpg", cap: "Before — bare drywall & concrete" },
        { src: "basement-before-1.jpg", cap: "Framing & rough-in stage" },
        { src: "basement-before-2.jpg", cap: "Fresh framing and drywall" },
        { src: "basement-before-3.jpg", cap: "Basement stairs — mid-renovation" }
      ]
    },
    {
      id: "kitchens",
      label: "Kitchens",
      blurb: "The heart of the home — cabinets, counters, paint, and tile, all handled by one crew.",
      cover: "kitchen-after-1.jpg",
      photos: [
        { src: "kitchen-after-1.jpg", cap: "Freshly finished white cabinets" },
        { src: "kitchen-after-2.jpg", cap: "Cabinets, counters & new appliances" },
        { before: "kitchen-before.jpg", after: "kitchen-after-2.jpg", cap: "Kitchen refresh — Elgin, IL" }
      ]
    },
    {
      id: "finishes",
      label: "Painting, Flooring & Tile",
      blurb: "Interior painting, flooring, tile, trim, and drywall — the finish work that makes a whole project feel done.",
      cover: "bath-floor-after.jpg",
      photos: [
        { before: "bath-floor-before.jpg", after: "bath-floor-after.jpg", cap: "New hex marble tile flooring — Elgin, IL" },
        { src: "plumbing.jpg", cap: "Rough-in plumbing, coordinated through our licensed trade partners" }
        /* Add painting / flooring / trim / drywall photos here as you collect them:
           { before: "paint-job1-before.jpg", after: "paint-job1-after.jpg", cap: "Living room repaint — Elgin" }, */
      ]
    }
  ];

  /* ---------- reusable before/after slider ---------- */
  var makeBASlider = function (root) {
    var wrap = $(".ba-before-wrap", root);
    var beforeImg = $(".ba-before", root);
    var handle = $(".ba-handle", root);
    if (!wrap || !beforeImg || !handle) return;
    var pct = 50;
    var sizeBefore = function () { beforeImg.style.width = root.clientWidth + "px"; };
    var setPct = function (p) {
      pct = Math.max(0, Math.min(100, p));
      wrap.style.width = pct + "%";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    };
    sizeBefore();
    setPct(50);
    window.addEventListener("resize", sizeBefore);
    var fromEvent = function (e) {
      var rect = root.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPct((x / rect.width) * 100);
    };
    var dragging = false;
    root.addEventListener("pointerdown", function (e) { dragging = true; fromEvent(e); e.preventDefault(); });
    window.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); }, { passive: true });
    window.addEventListener("pointerup", function () { dragging = false; });
    handle.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { setPct(pct - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPct(pct + 4); e.preventDefault(); }
    });
  };

  // featured slider already in the page markup
  var pageBA = $("#baSlider");
  if (pageBA) makeBASlider(pageBA);

  var baMarkup = function (beforeSrc, afterSrc) {
    return '<div class="ba-slider lb-ba">' +
      '<img class="ba-after" src="' + afterSrc + '" alt="After">' +
      '<div class="ba-before-wrap"><img class="ba-before" src="' + beforeSrc + '" alt="Before"></div>' +
      '<span class="ba-label ba-label-before">Before</span>' +
      '<span class="ba-label ba-label-after">After</span>' +
      '<div class="ba-handle" role="slider" aria-label="Drag to compare before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M15 7l5 5-5 5"/></svg></div></div>';
  };

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  var lbStage = $("#lbStage");
  var lbCap = $("#lbCap");
  var photos = [];
  var idx = 0;

  var renderLb = function () {
    var p = photos[idx];
    if (p.before && p.after) {
      lbStage.innerHTML = baMarkup(imgURL(p.before), imgURL(p.after));
      makeBASlider($(".lb-ba", lbStage));
    } else {
      lbStage.innerHTML = '<img id="lbImg" src="' + imgURL(p.src) + '" alt="' + (p.cap || "") + '">';
    }
    lbCap.textContent = p.cap || "";
  };
  var openLb = function (catIndex) {
    var cat = GALLERY[catIndex];
    photos = cat ? cat.photos : [];
    if (!photos.length) return;
    idx = 0;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    renderLb();
  };
  var closeLb = function () {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbStage.innerHTML = "";
  };
  var step = function (d) { idx = (idx + d + photos.length) % photos.length; renderLb(); };

  $("#lbClose").addEventListener("click", function (e) { e.stopPropagation(); closeLb(); });
  $("#lbPrev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  $("#lbNext").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  window.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ---------- build project cards from GALLERY ---------- */
  var projectsEl = $("#projects");
  if (projectsEl) {
    GALLERY.forEach(function (cat, i) {
      var card = document.createElement("article");
      card.className = "project-card";
      card.style.cursor = "pointer";
      card.innerHTML =
        '<div class="project-img"><img src="' + imgURL(cat.cover) + '" alt="' + cat.label + ' remodel by Aguila Construction" loading="lazy">' +
        '<span class="tag-pill">' + cat.photos.length + ' photos</span></div>' +
        '<div class="project-body"><h3>' + cat.label + '</h3><p>' + cat.blurb + '</p>' +
        '<button class="link-arrow" type="button">View Gallery <span class="arr">&rarr;</span></button></div>';
      card.addEventListener("click", function () { openLb(i); });
      projectsEl.appendChild(card);
    });
  }

  /* ---------- free quote modal (GoHighLevel form) ---------- */
  var quoteModal = $("#quoteModal");
  if (quoteModal) {
    var qmCloseBtn = $("#qmClose");
    var lastTrigger = null;

    /* Keep focus inside the dialog while it's open. The form is a
       cross-origin iframe, so we can't read its fields — instead we
       catch any focus that escapes the modal and pull it back in. */
    var trapFocus = function (e) {
      if (!quoteModal.hidden && !quoteModal.contains(e.target)) {
        if (qmCloseBtn) qmCloseBtn.focus();
      }
    };
    var openQuote = function () {
      lastTrigger = document.activeElement;
      quoteModal.hidden = false;
      document.body.style.overflow = "hidden";
      document.addEventListener("focusin", trapFocus);
      if (qmCloseBtn) qmCloseBtn.focus();
    };
    var closeQuote = function () {
      quoteModal.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("focusin", trapFocus);
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
      lastTrigger = null;
    };
    $$(".js-quote").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openQuote();
      });
    });
    if (qmCloseBtn) qmCloseBtn.addEventListener("click", closeQuote);
    quoteModal.addEventListener("click", function (e) {
      if (e.target === quoteModal) closeQuote();
    });
    window.addEventListener("keydown", function (e) {
      if (!quoteModal.hidden && e.key === "Escape") closeQuote();
    });
  }

  /* ---------- footer year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
