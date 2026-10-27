/* ==================================================================
   404: the requested path, a typed "404", the pigment field, and Mew,
   who is nearly invisible until the cursor comes close, sits a while,
   wanders around the screen, and teleports when clicked.
   ================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var REDUCED = root.classList.contains("reduced");
  var EN = root.dataset.lang === "en";
  var $ = function (id) {
    return document.getElementById(id);
  };

  /* ---------- language (French is in the HTML) ---------- */
  if (EN) {
    $("lost-line").textContent = "This page vanished.";
    $("lost-home-label").textContent = "Back to home";
    $("mew").title = $("mew").dataset.titleEn;
    document.title = "404 · jularthus.fr";
  }
  root.classList.remove("i18n-pending");

  /* ---------- the path that was asked for ---------- */
  var path = location.pathname || "/";
  try {
    path = decodeURIComponent(path);
  } catch (e) {}
  if (path.length > 48) path = path.slice(0, 45) + "...";
  $("lost-path").textContent = path; // textContent: never parsed as HTML

  /* ---------- pigment field (same shader as the home page) ---------- */
  function startPigment() {
    if (window.Pigment) window.Pigment.init($("pigment"), { still: REDUCED, pointerTarget: document.body });
  }
  if (document.readyState === "complete") setTimeout(startPigment, 50);
  else
    window.addEventListener("load", function () {
      if (window.requestIdleCallback) window.requestIdleCallback(startPigment, { timeout: 1500 });
      else setTimeout(startPigment, 200);
    });

  /* ---------- "404" types itself ---------- */
  var lost = $("lost");
  var digits = Array.prototype.slice.call($("lost-digits").children, 0, 3);
  function finish() {
    lost.classList.add("done");
    sitOn(0);
  }
  if (REDUCED) {
    digits.forEach(function (d) {
      d.classList.add("on");
    });
    setTimeout(finish, 0); // once Mew's setup below has run
  } else {
    var i = 0;
    setTimeout(function tick() {
      digits[i++].classList.add("on");
      if (i < digits.length) setTimeout(tick, 150 + Math.random() * 60);
      else setTimeout(finish, 220);
    }, 450);
  }

  /* ---------- Enter goes home ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && document.activeElement === document.body) location.href = "/";
  });

  /* ==================================================================
     MEW
     ================================================================== */
  var mew = $("mew");
  var perch = 0;
  var pos = { x: 0, y: 0 }; // Mew's feet, in viewport pixels
  var state = "hidden"; // hidden | sitting | flying | popping
  var flight = null;
  var sitTimer = 0;
  var pointer = null; // last mouse position, for the proximity glow

  /* Where Mew can sit: on top of the last "4", on the red caret, at the
     end of the $ line. Each returns the spot for Mew's feet. */
  var PERCHES = [
    function () {
      var r = $("perch-4").getBoundingClientRect();
      var fs = parseFloat(getComputedStyle($("perch-4")).fontSize);
      // In DM Serif Display the drawn "4" starts 0.38 em below its line
      // box (measured); Mew sits on the top of the italic stem, right side.
      return { x: r.left + r.width * 0.74, y: r.top + fs * 0.38 };
    },
    function () {
      var r = document.querySelector(".caret").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + 2 };
    },
    function () {
      var r = $("lost-path").getBoundingClientRect();
      return { x: r.right + mew.offsetWidth * 0.62, y: r.bottom + 4 };
    },
  ];

  /* Proximity: --t goes from 0 (cursor far) to 1 (cursor close). */
  function updateGlow() {
    if (!pointer) return;
    var cx = pos.x;
    var cy = pos.y - mew.offsetHeight / 2;
    var d = Math.hypot(pointer.x - cx, pointer.y - cy);
    mew.style.setProperty("--t", Math.max(0, Math.min(1, 1 - (d - 50) / 240)).toFixed(3));
  }

  function draw() {
    mew.style.translate = (pos.x - mew.offsetWidth / 2).toFixed(1) + "px " + (pos.y - mew.offsetHeight + 10).toFixed(1) + "px";
    updateGlow();
  }

  /* Sit on a perch for a few seconds, then take off again. */
  function sitOn(n) {
    perch = n;
    var p = PERCHES[n]();
    pos.x = p.x;
    pos.y = p.y;
    state = "sitting";
    flight = null;
    mew.style.rotate = "0deg";
    draw();
    mew.classList.add("placed");
    clearTimeout(sitTimer);
    if (!REDUCED) sitTimer = setTimeout(takeOff, 5000 + Math.random() * 5000);
  }

  /* A spot for Mew's feet, anywhere on screen with its head still visible. */
  function randomSpot() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var m = mew.offsetWidth * 0.6;
    return {
      x: m + Math.random() * Math.max(1, w - 2 * m),
      y: mew.offsetHeight + 20 + Math.random() * Math.max(1, h - mew.offsetHeight - 50),
    };
  }

  /* Wander: two or three random stops, then land on another perch. */
  function takeOff() {
    var stops = [randomSpot(), randomSpot()];
    if (Math.random() < 0.5) stops.push(randomSpot());
    var next = (perch + 1 + Math.floor(Math.random() * (PERCHES.length - 1))) % PERCHES.length;
    stops.push({ perch: next });
    flight = { stops: stops, i: 0 };
    state = "flying";
    nextLeg(performance.now());
    requestAnimationFrame(fly);
  }

  function nextLeg(now) {
    var stop = flight.stops[flight.i];
    var to = stop.perch != null ? PERCHES[stop.perch]() : stop;
    var d = Math.hypot(to.x - pos.x, to.y - pos.y);
    flight.from = { x: pos.x, y: pos.y };
    flight.to = to;
    flight.t0 = now;
    flight.dur = Math.max(1600, (d / 90) * 1000); // a slow float, about 90 px/s
    flight.amp = (Math.random() < 0.5 ? -1 : 1) * Math.min(70, d * 0.2); // the curve's bulge
  }

  function easeInOut(u) {
    return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  }

  function fly(now) {
    if (state !== "flying" || !flight) return;
    var f = flight;
    var u = Math.min(1, (now - f.t0) / f.dur);
    var e = easeInOut(u);
    var dx = f.to.x - f.from.x;
    var dy = f.to.y - f.from.y;
    var len = Math.hypot(dx, dy) || 1;
    var bulge = Math.sin(Math.PI * e) * f.amp; // a gentle arc, not a straight line
    pos.x = f.from.x + dx * e - (dy / len) * bulge;
    pos.y = f.from.y + dy * e + (dx / len) * bulge;
    // lean into the direction of travel, most at mid-flight
    mew.style.rotate = ((dx / len) * 9 * Math.sin(Math.PI * u)).toFixed(2) + "deg";
    draw();
    if (u < 1) return requestAnimationFrame(fly);
    var stop = f.stops[f.i];
    if (stop.perch != null) return sitOn(stop.perch);
    f.i++;
    nextLeg(now);
    requestAnimationFrame(fly);
  }

  window.addEventListener("resize", function () {
    if (state === "sitting") {
      var p = PERCHES[perch]();
      pos.x = p.x;
      pos.y = p.y;
      draw();
    }
  });

  document.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (state !== "flying") updateGlow(); // while flying, every frame does it
    },
    { passive: true }
  );
  document.documentElement.addEventListener("pointerleave", function () {
    pointer = null;
    mew.style.setProperty("--t", "0");
  });

  /* Click: a psychic pop, then Mew reappears on the next perch, even
     mid-flight. */
  mew.addEventListener("click", function () {
    if (state === "popping") return;
    var next = (perch + 1) % PERCHES.length;
    clearTimeout(sitTimer);
    flight = null;
    if (REDUCED) return sitOn(next);
    state = "popping";
    mew.classList.remove("appear");
    mew.classList.add("pop");
    setTimeout(function () {
      sitOn(next);
      mew.style.setProperty("--t", "1");
      mew.classList.remove("pop");
      mew.classList.add("appear");
    }, 320);
  });
})();
