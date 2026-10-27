/* ==================================================================
   404: the requested path, a typed "404", the pigment field, and Mew,
   who is nearly invisible until the cursor comes close, and
   teleports to another perch when clicked.
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
    placeMew(0, true);
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
  var box = mew.parentElement; // .lost-in, the positioning context
  var perch = 0;

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

  function placeMew(n, first) {
    var b = box.getBoundingClientRect();
    var p = PERCHES[n]();
    mew.style.left = p.x - b.left - mew.offsetWidth / 2 + "px";
    mew.style.top = p.y - b.top - mew.offsetHeight + 10 + "px";
    if (first) mew.classList.add("placed");
  }
  window.addEventListener("resize", function () {
    if (mew.classList.contains("placed")) placeMew(perch);
  });

  /* Materialize near the cursor: --t goes from 0 (far) to 1 (close). */
  var raf = 0;
  document.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType !== "mouse" || raf) return;
      var x = e.clientX;
      var y = e.clientY;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = mew.getBoundingClientRect();
        var d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        var t = Math.max(0, Math.min(1, 1 - (d - 50) / 240));
        mew.style.setProperty("--t", t.toFixed(3));
      });
    },
    { passive: true }
  );
  document.documentElement.addEventListener("pointerleave", function () {
    mew.style.setProperty("--t", "0");
  });

  /* Click: a psychic pop, then Mew reappears on the next perch. */
  var busy = false;
  mew.addEventListener("click", function () {
    if (busy) return;
    perch = (perch + 1) % PERCHES.length;
    if (REDUCED) return placeMew(perch);
    busy = true;
    mew.classList.remove("appear");
    mew.classList.add("pop");
    setTimeout(function () {
      placeMew(perch);
      mew.style.setProperty("--t", "1");
      mew.classList.remove("pop");
      mew.classList.add("appear");
      busy = false;
    }, 320);
  });
})();
