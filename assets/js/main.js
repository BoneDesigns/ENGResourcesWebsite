/* =====================================================================
   ENG RESOURCES — main.js
   Nav · scroll-reveal · count-up · case filters · Leaflet map · form
   ===================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------  Sticky header state  ---------- */
  var header = document.querySelector(".site-header");
  var forceSolid = header && header.dataset.solid === "true";
  function onScroll() {
    if (!header) return;
    if (forceSolid || window.scrollY > 24) header.classList.add("is-solid");
    else header.classList.remove("is-solid");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----------  Mobile nav  ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ----------  Scroll reveal  ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ----------  Count-up stats  ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var dur = 1400, start = null;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ----------  Case study filters  ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll("[data-cat]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      cards.forEach(function (card) {
        var show = cat === "all" || card.dataset.cat.split(" ").indexOf(cat) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ----------  Contact form (front-end only)  ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.checkValidity();
      if (!ok) { form.reportValidity(); return; }
      var success = document.querySelector("#form-success");
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      // Placeholder: wire to a real endpoint / email service later.
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = "Send message"; }
        if (success) {
          success.classList.add("is-shown");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
      }, 700);
    });
  }

  /* ----------  Leaflet locations map  ---------- */
  var mapEl = document.getElementById("map");
  if (mapEl && window.L) {
    var locations = [
      { city: "Nashville", region: "Tennessee — Central Hub", lat: 36.1627, lng: -86.7816, hub: true },
      { city: "Chattanooga", region: "Tennessee", lat: 35.0456, lng: -85.3097 },
      { city: "Knoxville", region: "Tennessee", lat: 35.9606, lng: -83.9207 },
      { city: "Tuscaloosa", region: "Alabama", lat: 33.2098, lng: -87.5692 },
      { city: "Atlanta", region: "Georgia", lat: 33.7490, lng: -84.3880 }
    ];

    var map = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    }).setView([34.6, -85.7], 6);

    // Muted CARTO basemap to match the brand
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19, attribution: ""
    }).addTo(map);

    var starSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.8l6.9-.7L12 2z"/></svg>';
    var pinIcon = L.divIcon({ className: "", html: '<div class="eng-pin"></div>', iconSize: [26, 26], iconAnchor: [13, 24], popupAnchor: [0, -22] });
    var hubIcon = L.divIcon({ className: "", html: '<div class="eng-pin-hub">' + starSvg + '</div>', iconSize: [40, 40], iconAnchor: [20, 38], popupAnchor: [0, -34] });

    var markers = {};
    var group = [];
    locations.forEach(function (loc) {
      var m = L.marker([loc.lat, loc.lng], { icon: loc.hub ? hubIcon : pinIcon, title: loc.city, zIndexOffset: loc.hub ? 1000 : 0 }).addTo(map);
      var popupRegion = loc.hub ? "Central Hub · Tennessee" : loc.region;
      m.bindPopup('<div class="map-popup"><div class="city">' + loc.city + (loc.hub ? ' <span class="hub-badge">Hub</span>' : '') + '</div><div class="region">' + popupRegion + '</div></div>');
      if (loc.hub) {
        m.bindTooltip("Nashville · Hub", { permanent: true, direction: "top", className: "hub-tip", offset: [0, -36] });
      }
      markers[loc.city] = m;
      group.push([loc.lat, loc.lng]);
    });
    if (group.length) map.fitBounds(group, { padding: [70, 70], maxZoom: 6 });

    // Link the location list rows to the map
    document.querySelectorAll(".location-row").forEach(function (row) {
      row.addEventListener("click", function () {
        var city = row.dataset.city;
        var m = markers[city];
        if (m) {
          map.flyTo(m.getLatLng(), 9, { duration: 0.8 });
          m.openPopup();
        }
        document.querySelectorAll(".location-row").forEach(function (r) { r.classList.remove("is-active"); });
        row.classList.add("is-active");
      });
    });
  }

  /* ----------  Case-study scroll progress + active jump link  ---------- */
  var progress = document.querySelector(".cs-progress");
  var jumpLinks = [].slice.call(document.querySelectorAll(".cs-jump a"));
  var sections = jumpLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if (progress || sections.length) {
    var ticking = false;
    function update() {
      ticking = false;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      if (sections.length) {
        var mid = window.scrollY + window.innerHeight * 0.35;
        var current = sections[0];
        sections.forEach(function (s) { if (s.offsetTop <= mid) current = s; });
        jumpLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + current.id);
        });
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ----------  Footer year  ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
