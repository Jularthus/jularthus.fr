/* Runs in <head>, before first paint: flags JS support and picks the
   language so English visitors never see a flash of French.
   Order: ?lang= in the URL, then the remembered choice, then the browser. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var lang = null;
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "fr" || q === "en") lang = q;
  } catch (e) {}
  if (!lang) {
    try {
      var saved = localStorage.getItem("lang");
      if (saved === "fr" || saved === "en") lang = saved;
    } catch (e) {}
  }
  if (!lang) {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "fr";
    lang = /^fr\b/i.test(nav) ? "fr" : "en";
  }
  root.lang = lang;
  root.dataset.lang = lang;
  /* The page waits for site.js to translate it; a CSS failsafe reveals it anyway. */
  if (lang === "en") root.classList.add("i18n-pending");

  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("reduced");
  }
})();
