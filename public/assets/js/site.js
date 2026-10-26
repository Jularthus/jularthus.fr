/* ==================================================================
   SITE: everything that moves. Each block degrades on its own:
   no GSAP means plain reveals, reduced motion means a still page,
   no JS at all means the French HTML, complete.
   ================================================================== */
(function () {
  "use strict";

  var D = window.SITE_DATA;
  var root = document.documentElement;
  var REDUCED = root.classList.contains("reduced");
  var FINE = window.matchMedia("(pointer: fine)").matches;
  var G = window.gsap && window.ScrollTrigger ? window.gsap : null;
  var ST = window.ScrollTrigger;
  if (G) G.registerPlugin(ST, window.SplitText);

  function $(s, c) {
    return (c || document).querySelector(s);
  }
  function $$(s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  /* ==============================================================
     I18N: French is read from the HTML once; English comes from
     SITE_DATA.EN. Hooks let animated pieces get out of the way.
     ============================================================== */
  var lang = root.dataset.lang === "en" ? "en" : "fr";
  var FR_HTML = new Map();
  var FR_ATTR = new Map();
  var beforeLang = [];
  var afterLang = [];

  function attrPairs(el) {
    return el.dataset.i18nAttr.split(";").map(function (p) {
      var i = p.indexOf(":");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    });
  }

  $$("[data-i18n], [data-i18n-html]").forEach(function (el) {
    FR_HTML.set(el, el.innerHTML);
  });
  $$("[data-i18n-attr]").forEach(function (el) {
    var o = {};
    attrPairs(el).forEach(function (p) {
      o[p[0]] = el.getAttribute(p[0]);
    });
    FR_ATTR.set(el, o);
  });

  /* Current-language markup for one [data-i18n] element. */
  function tr(el) {
    var key = el.dataset.i18n || el.dataset.i18nHtml;
    if (lang === "en" && D.EN[key] != null) return D.EN[key];
    return FR_HTML.get(el);
  }
  function ui() {
    return D.UI[lang];
  }

  function applyLang(l) {
    beforeLang.forEach(function (f) {
      f();
    });
    lang = l;
    FR_HTML.forEach(function (_, el) {
      var v = tr(el);
      if (v != null && el.innerHTML !== v) el.innerHTML = v;
    });
    FR_ATTR.forEach(function (fr, el) {
      attrPairs(el).forEach(function (p) {
        var v = l === "en" && D.EN[p[1]] != null ? D.EN[p[1]] : fr[p[0]];
        if (v != null) el.setAttribute(p[0], v);
      });
    });
    root.lang = l;
    root.dataset.lang = l;
    document.title = D.META[l].title;
    var md = $('meta[name="description"]');
    if (md) md.setAttribute("content", D.META[l].desc);
    $$("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === l));
    });
    afterLang.forEach(function (f) {
      f();
    });
  }

  function setLang(l, opts) {
    if (l === lang && !(opts && opts.force)) return;
    try {
      localStorage.setItem("lang", l);
    } catch (e) {}
    try {
      var u = new URL(location.href);
      if (u.searchParams.has("lang")) {
        u.searchParams.set("lang", l);
        history.replaceState(history.state, "", u);
      }
    } catch (e) {}
    var run = function () {
      applyLang(l);
    };
    if (document.startViewTransition && !REDUCED && !(opts && opts.instant)) {
      document.startViewTransition(run).finished.then(refresh);
    } else {
      run();
      refresh();
    }
  }

  function refresh() {
    if (G) ST.refresh();
  }

  applyLang(lang);
  root.classList.remove("i18n-pending");
  $$("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.dataset.setLang);
    });
  });

  /* ==============================================================
     SMOOTH SCROLL (Lenis) + anchor routing.
     The pinned gallery means a project card's page position is not
     its DOM position, so anchors go through scrollToTarget().
     ============================================================== */
  var lenis = null;
  if (G && window.Lenis && !REDUCED) {
    lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, prevent: function (n) {
      return n.closest && n.closest("dialog, [data-lenis-prevent]");
    } });
    lenis.on("scroll", ST.update);
    G.ticker.add(function (t) {
      lenis.raf(t * 1000);
    });
    G.ticker.lagSmoothing(0);
  }

  var NAV_OFFSET = 72;
  var gallery = { st: null, cards: [] };

  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.3 });
    else window.scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
  }

  function scrollToTarget(id) {
    if (id === "top") return scrollToY(0);
    var el = document.getElementById(id);
    if (!el) return;
    var i = gallery.cards.indexOf(el);
    if (gallery.st && i >= 0) {
      var st = gallery.st;
      var p = gallery.cards.length > 1 ? i / (gallery.cards.length - 1) : 0;
      return scrollToY(st.start + p * (st.end - st.start) + 2);
    }
    var y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    scrollToY(Math.max(0, y));
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    var id = a.getAttribute("href").slice(1);
    if (!id || (!document.getElementById(id) && id !== "top")) return;
    if (a.id === "mail-btn") return;
    e.preventDefault();
    scrollToTarget(id);
    if (id !== "main") history.replaceState(history.state, "", "#" + id);
    else $("#main").focus({ preventScroll: true });
  });
  $("#main").setAttribute("tabindex", "-1");

  /* ==============================================================
     NAV: transparent over the hero, scroll-spy elsewhere.
     ============================================================== */
  var nav = $("#nav");
  var hero = $(".hero");
  var navTick = false;
  function navState() {
    navTick = false;
    nav.classList.toggle("on-hero", window.scrollY < hero.offsetHeight - nav.offsetHeight);
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!navTick) {
        navTick = true;
        requestAnimationFrame(navState);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", navState);
  navState();

  /* Scroll-spy: the section crossing the middle of the screen wins. */
  (function () {
    if (!("IntersectionObserver" in window)) return;
    var spyMap = { "a-propos": "a-propos", projets: "projets", selection: "projets", parcours: "parcours", stack: "stack", contact: "contact" };
    var links = {};
    $$(".nav-links a").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var spy = new IntersectionObserver(
      function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          var a = links[spyMap[e.target.id]];
          $$(".nav-links a.active").forEach(function (x) {
            if (x !== a) x.classList.remove("active");
          });
          if (!a) return;
          a.classList.add("active");
          if (window.innerWidth < 860) {
            a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(spyMap).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
    new IntersectionObserver(
      function (en) {
        if (en[0].isIntersecting) $$(".nav-links a.active").forEach(function (x) {
          x.classList.remove("active");
        });
      },
      { rootMargin: "0px 0px -60% 0px" }
    ).observe(hero);
  })();

  var IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (IS_MAC) {
    $("#kbd-mod").textContent = "⌘";
  }
  function fixHintKbd() {
    if (!IS_MAC) return;
    $$(".foot-hint kbd").forEach(function (k) {
      if (k.textContent === "Ctrl") k.textContent = "⌘";
    });
  }
  fixHintKbd();
  afterLang.push(fixHintKbd);

  /* ==============================================================
     HERO: pigment field, typing, counters, scroll-out.
     ============================================================== */
  /* The shader compiles once the page has loaded and the main thread is
     idle, so it never competes with the first paint. */
  var pigment = null;
  function startPigment() {
    if (!window.Pigment) return;
    pigment = window.Pigment.init($("#pigment"), { still: REDUCED, pointerTarget: hero });
    window.__pigment = pigment;
  }
  function whenIdle(f) {
    if (window.requestIdleCallback) requestIdleCallback(f, { timeout: 1500 });
    else setTimeout(f, 200);
  }
  if (document.readyState === "complete") whenIdle(startPigment);
  else window.addEventListener("load", function () {
    whenIdle(startPigment);
  });

  function runCounters() {
    $$(".count").forEach(function (el) {
      var from = +el.dataset.from;
      var to = +el.dataset.to;
      if (!G || REDUCED) {
        el.textContent = to;
        return;
      }
      var o = { v: from };
      el.textContent = from;
      G.to(o, {
        v: to,
        duration: 1.8,
        ease: "power3.out",
        delay: 0.3,
        onUpdate: function () {
          el.textContent = Math.round(o.v);
        },
      });
    });
  }

  (function typing() {
    var typed = $("#typed");
    var word = typed.textContent;
    if (REDUCED) {
      hero.classList.add("done");
      runCounters();
      return;
    }
    typed.textContent = "";
    var i = 0;
    setTimeout(function tick() {
      typed.textContent = word.slice(0, ++i);
      if (i < word.length) setTimeout(tick, 70 + Math.random() * 60);
      else
        setTimeout(function () {
          hero.classList.add("done");
          runCounters();
        }, 180);
    }, 500);
  })();

  if (G && !REDUCED) {
    G.set(".hero-stage", { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    G.to(".hero-stage", {
      clipPath: "inset(0% 2.5% 10% 2.5% round 28px)",
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
    G.to(".hero-in", {
      yPercent: -12,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ==============================================================
     REVEALS: one IntersectionObserver for every .io element.
     ============================================================== */
  var revealIO = null;
  if (REDUCED || !("IntersectionObserver" in window)) {
    $$(".io").forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    revealIO = new IntersectionObserver(
      function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".io").forEach(function (el) {
      revealIO.observe(el);
    });
  }

  /* Decrypt: letters hesitate, then settle left to right. */
  if (!REDUCED && "IntersectionObserver" in window) {
    var GLYPHS = "#</>{}[]=+*x_$";
    $$("[data-decrypt]").forEach(function (title) {
      var span = $("[data-i18n]", title);
      if (!span) return;
      var obs = new IntersectionObserver(
        function (en) {
          if (!en[0].isIntersecting) return;
          obs.disconnect();
          var text = span.textContent;
          title.setAttribute("aria-label", title.textContent);
          var frame = 0;
          var total = Math.max(16, text.length + 8);
          var timer = setInterval(function () {
            frame++;
            var settled = Math.floor((frame / total) * text.length);
            var out = "";
            for (var i = 0; i < text.length; i++) {
              var ch = text[i];
              out += i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
            span.textContent = out;
            if (frame >= total) {
              clearInterval(timer);
              span.innerHTML = tr(span);
              title.removeAttribute("aria-label");
            }
          }, 34);
        },
        { threshold: 0.5 }
      );
      obs.observe(title);
    });
  }

  /* Split reveals: lines rise out of a mask, then the split is undone. */
  var splits = [];
  if (G && window.SplitText && !REDUCED) {
    $$("[data-split]").forEach(function (el) {
      var split = window.SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      var tw = G.from(split.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onComplete: function () {
          split.revert();
        },
      });
      splits.push({ split: split, tw: tw });
    });
    beforeLang.push(function () {
      splits.forEach(function (s) {
        if (s.tw.scrollTrigger) s.tw.scrollTrigger.kill();
        s.tw.kill();
        s.split.revert();
      });
      splits = [];
    });
  }

  /* ==============================================================
     TERMINAL: autoplays the infra facts, then it's yours.
     ============================================================== */
  (function terminal() {
    var term = $("#term");
    var body = $("#term-body");
    var form = $("#term-form");
    var input = $("#term-input");
    if (!term || !form) return;
    var PS = '<span class="t-ps">visiteur@jarvis:~$</span>';
    var hist = [];
    var hIdx = 0;
    var busy = false;

    function scrollBottom() {
      body.scrollTop = body.scrollHeight;
    }
    function out(html, cls) {
      var d = document.createElement("div");
      d.className = cls || "t-out";
      d.innerHTML = html;
      body.insertBefore(d, form);
      scrollBottom();
      return d;
    }
    function clearScreen() {
      $$(":scope > :not(form)", body).forEach(function (n) {
        n.remove();
      });
    }
    function line(cmd) {
      return out(PS + esc(cmd), "t-line");
    }
    function sleep(ms) {
      return new Promise(function (r) {
        setTimeout(r, ms);
      });
    }
    function typeLine(cmd) {
      var d = out(PS, "t-line");
      var i = 0;
      return new Promise(function (resolve) {
        (function step() {
          d.innerHTML = PS + esc(cmd.slice(0, i));
          scrollBottom();
          if (i++ < cmd.length) setTimeout(step, 28 + Math.random() * 40);
          else resolve();
        })();
      });
    }
    function findProject(q) {
      q = norm(q || "");
      if (!q) return null;
      return (
        D.PROJECTS.filter(function (p) {
          return p.slug === q || norm(p.name) === q;
        })[0] ||
        D.PROJECTS.filter(function (p) {
          return p.slug.indexOf(q) === 0 || norm(p.name).indexOf(q) === 0;
        })[0] ||
        null
      );
    }
    function linkCmd(cmd, label) {
      return '<button type="button" class="t-link" data-cmd="' + esc(cmd) + '">' + (label || esc(cmd)) + "</button>";
    }
    function email() {
      return ["jules.arthus.klein", "gmail.com"].join("@");
    }

    var ART = [
      " .----------------------.",
      " |  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  |",
      " |  ▓▓  J A r v i s ▓▓  |",
      " |  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  |",
      " '----------------------'",
      "  \\ :::::::::::::::::: \\",
      "   '--------------------'",
    ].join("\n");

    var COMMANDS = {
      help: function () {
        out(
          ui().term.help
            .map(function (h) {
              var name = h[0].split(" ")[0];
              return linkCmd(name === "cat" || name === "open" ? name + " devdocker" : h[0].replace(/&lt;|&gt;/g, ""), h[0]) + "  " + '<span style="opacity:.7">' + h[1] + "</span>";
            })
            .join("\n")
        );
      },
      whoami: function () {
        out(ui().term.whoami);
      },
      uptime: function () {
        out(ui().term.uptime);
      },
      neofetch: function () {
        out(esc(ART), "t-out t-art");
        out(
          ui().term.neo
            .map(function (r) {
              return '<b style="color:#e8912d">' + r[0] + "</b>: " + r[1];
            })
            .join("\n")
        );
      },
      ls: function () {
        out(
          D.PROJECTS.map(function (p) {
            return linkCmd("cat " + p.slug, p.slug + "/");
          }).join("   ")
        );
        out(ui().term.lsHint);
      },
      cat: function (arg) {
        if (arg === "/etc/issue") return out(ui().term.issue);
        if (/authelia|policy/.test(arg || "")) return out(ui().term.policy);
        var p = findProject(arg);
        if (!p) return out(ui().term.noProject(esc(arg || "")), "t-out t-err");
        out(ui().term.catGo(esc(p.name)), "t-out t-ok");
        setTimeout(function () {
          scrollToTarget(p.id);
        }, 350);
      },
      open: function (arg) {
        var p = findProject(arg);
        if (!p) return out(ui().term.noProject(esc(arg || "")), "t-out t-err");
        out(ui().term.openGo(esc(p.name)), "t-out t-ok");
        window.open(p.url, "_blank", "noopener");
      },
      stack: function () {
        out(ui().term.stack);
        setTimeout(function () {
          scrollToTarget("stack");
        }, 350);
      },
      contact: function () {
        out(
          ui().term.contact +
            '<a href="mailto:' + email() + '">' + email() + "</a>\nGitHub: " +
            '<a href="https://github.com/Jularthus" target="_blank" rel="noopener noreferrer">github.com/Jularthus</a>\nDiscord: @jularthus'
        );
      },
      lang: function (arg) {
        var l = arg === "en" || arg === "fr" ? arg : lang === "fr" ? "en" : "fr";
        setLang(l);
        out(ui().term.langSet, "t-out t-ok");
      },
      clear: function () {
        clearScreen();
      },
      history: function () {
        out(
          hist
            .map(function (h, i) {
              return "  " + (i + 1) + "  " + esc(h);
            })
            .join("\n") || "(vide)"
        );
      },
      echo: function (arg, raw) {
        out(esc(raw.replace(/^echo\s*/, "")));
      },
      date: function () {
        out(new Date().toLocaleString(lang === "fr" ? "fr-FR" : "en-GB"));
      },
      pwd: function () {
        out(ui().term.pwd);
      },
      cd: function () {
        out(ui().term.cd);
      },
      exit: function () {
        out(ui().term.exit);
      },
      docker: function () {
        out(ui().term.ps);
      },
      grep: function () {
        out(ui().term.policy);
      },
      sudo: function (arg) {
        if (/rm\s+-rf/.test(arg || "")) return out(ui().term.rm, "t-out t-err");
        out(ui().term.sudo, "t-out t-err");
      },
      rm: function () {
        out(ui().term.rm, "t-out t-err");
      },
      ssh: function () {
        out(ui().term.ssh, "t-out t-err");
      },
      nmap: function () {
        out(ui().term.hack, "t-out t-err");
      },
    };
    COMMANDS.hydra = COMMANDS.nmap;
    COMMANDS.hack = COMMANDS.nmap;
    COMMANDS.ll = COMMANDS.ls;
    COMMANDS.dir = COMMANDS.ls;
    COMMANDS.man = COMMANDS.help;

    function run(raw) {
      raw = raw.trim();
      line(raw);
      if (!raw) return;
      hist.push(raw);
      hIdx = hist.length;
      var parts = raw.split(/\s+/);
      var name = parts[0].toLowerCase();
      var arg = parts.slice(1).join(" ");
      var f = COMMANDS[name];
      if (f) f(arg, raw);
      else out(ui().term.notFound(esc(name)), "t-out t-err");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      var v = input.value;
      input.value = "";
      run(v);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        if (hIdx > 0) input.value = hist[--hIdx];
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (hIdx < hist.length - 1) input.value = hist[++hIdx];
        else {
          hIdx = hist.length;
          input.value = "";
        }
        e.preventDefault();
      } else if (e.key === "Tab") {
        var v = input.value;
        var m = v.match(/^(cat|open)\s+(\S*)$/i);
        var pool = m
          ? D.PROJECTS.map(function (p) {
              return m[1] + " " + p.slug;
            })
          : Object.keys(COMMANDS);
        var hits = pool.filter(function (c) {
          return c.indexOf(v) === 0 && c !== v;
        });
        if (v && hits.length === 1) {
          input.value = hits[0] + (m ? "" : " ");
          e.preventDefault();
        } else if (v && hits.length > 1) {
          line(v);
          out(hits.join("   "));
          e.preventDefault();
        }
      } else if (e.key === "Escape") {
        input.blur();
      } else if (e.key === "l" && e.ctrlKey) {
        clearScreen();
        e.preventDefault();
      }
    });
    body.addEventListener("click", function (e) {
      var b = e.target.closest(".t-link");
      if (b) {
        if (busy) return;
        run(b.dataset.cmd);
        input.focus({ preventScroll: true });
      } else if (!window.getSelection().toString()) {
        input.focus({ preventScroll: true });
      }
    });

    var INTRO = [
      ["uptime", "uptime"],
      ["cat /etc/issue", "issue"],
      ["docker compose ps", "ps"],
      ["grep policy authelia.yml", "policy"],
    ];

    function finish() {
      busy = false;
      form.removeAttribute("aria-disabled");
      out(ui().term.hint, "t-out");
    }

    if (REDUCED) {
      finish();
      return;
    }
    busy = true;
    form.setAttribute("aria-disabled", "true");
    var started = false;
    new IntersectionObserver(
      function (en, obs) {
        if (!en[0].isIntersecting || started) return;
        started = true;
        obs.disconnect();
        clearScreen();
        INTRO.reduce(function (p, step) {
          return p
            .then(function () {
              return typeLine(step[0]);
            })
            .then(function () {
              return sleep(160);
            })
            .then(function () {
              out(ui().term[step[1]]);
              return sleep(320);
            });
        }, sleep(500)).then(finish);
      },
      { threshold: 0.45 }
    ).observe(term);
  })();

  /* ==============================================================
     SELECTION: pinned horizontal gallery (desktop), tilt, previews.
     ============================================================== */
  var track = $("#gallery-track");
  gallery.cards = $$(".pcard", track);
  var selIdx = $("#sel-idx");

  if (G && !REDUCED) {
    var mm = G.matchMedia();
    mm.add("(min-width: 1024px) and (min-height: 600px)", function () {
      var sel = $("#selection");
      sel.classList.add("is-pinned");
      var dist = function () {
        return Math.max(0, track.scrollWidth - window.innerWidth);
      };
      var tw = G.to(track, {
        x: function () {
          return -dist();
        },
        ease: "none",
        scrollTrigger: {
          trigger: ".sel-pin",
          pin: true,
          start: "top top",
          end: function () {
            return "+=" + dist();
          },
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var n = gallery.cards.length;
            var i = Math.min(n, Math.round(self.progress * (n - 1)) + 1);
            selIdx.textContent = (i < 10 ? "0" : "") + i;
          },
        },
      });
      gallery.st = tw.scrollTrigger;
      return function () {
        sel.classList.remove("is-pinned");
        gallery.st = null;
        G.set(track, { clearProps: "transform" });
      };
    });
  }

  if (FINE && !REDUCED) {
    gallery.cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.classList.add("tilting");
        card.style.transition = "transform .18s ease-out, box-shadow .4s, border-color .4s";
        card.style.transform =
          "perspective(900px) rotateX(" + ((0.5 - py) * 6).toFixed(2) + "deg) rotateY(" + ((px - 0.5) * 8).toFixed(2) + "deg)";
        card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("tilting");
        card.style.transition = "transform .7s cubic-bezier(.22,1,.36,1), box-shadow .4s, border-color .4s";
        card.style.transform = "";
      });
    });
  }

  /* DevDocker preview: the session replays line by line while visible. */
  (function asciiLoop() {
    var pre = $('[data-loop="devdocker"]');
    if (!pre || REDUCED || !("IntersectionObserver" in window)) return;
    var lines = pre.innerHTML.split("\n");
    var i = lines.length;
    var timer = null;
    function step() {
      i = i >= lines.length ? 1 : i + 1;
      pre.innerHTML = lines.slice(0, i).join("\n");
      timer = setTimeout(step, i >= lines.length ? 2600 : i === 1 ? 700 : 260);
    }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) {
        if (!timer) {
          i = lines.length;
          step();
        }
      } else {
        clearTimeout(timer);
        timer = null;
        pre.innerHTML = lines.join("\n");
      }
    }).observe(pre);
  })();

  /* 1 million d'amis: the live counter, via a same-origin proxy. */
  (function beers() {
    var chip = $("#beer-live");
    var txt = $("#beer-live-txt");
    var data = null;
    function render() {
      if (!data) return;
      txt.textContent = ui().beers(data);
      chip.hidden = false;
    }
    if (location.protocol.indexOf("http") !== 0) return;
    fetch("/live/beers", { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (d) {
        if (d && typeof d.total === "number" && d.eta) {
          data = d;
          render();
        }
      })
      .catch(function () {});
    afterLang.push(render);
  })();

  /* ==============================================================
     TIMELINE: the spine draws with scroll, nodes light as it passes.
     ============================================================== */
  var tlItems = $$(".tl-item");
  if (G && !REDUCED) {
    G.to(".tl-spine", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 70%", scrub: 0.4 },
    });
    tlItems.forEach(function (it) {
      ST.create({
        trigger: it,
        start: "top 70%",
        onEnter: function () {
          it.classList.add("lit");
        },
        onLeaveBack: function () {
          it.classList.remove("lit");
        },
      });
    });
  } else {
    tlItems.forEach(function (it) {
      it.classList.add("lit");
    });
    var sp = $(".tl-spine");
    if (sp) sp.style.transform = "none";
  }

  /* ==============================================================
     SKILLS: fill from the entry point; the sheet grows out of the
     card that was clicked (FLIP), inside a native <dialog>.
     ============================================================== */
  var sheet = $("#sheet");
  var sheetCard = $("#sheet-card");
  var currentSkill = null;

  $$(".skill").forEach(function (b) {
    b.addEventListener("pointerenter", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--x", ((e.clientX - r.left) / r.width) * 100 + "%");
      b.style.setProperty("--y", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
    b.addEventListener("click", function () {
      openSheet(b.dataset.skill, b);
    });
  });

  function fillSheet(slug) {
    var s = D.SKILLS[slug];
    var card = $('.skill[data-skill="' + slug + '"]');
    if (!s || !card) return false;
    $("#sheet-eyebrow").textContent = $(".skill-tag", card).textContent;
    $("#sheet-title").textContent = $(".skill-name", card).textContent;
    $("#sheet-desc").innerHTML = s.about[lang];
    $("#sheet-points").innerHTML = s.points[lang]
      .map(function (p) {
        return "<li>" + p + "</li>";
      })
      .join("");
    return true;
  }

  function openSheet(slug, from) {
    if (!sheet.showModal || !fillSheet(slug)) return;
    currentSkill = slug;
    var flip = G && !REDUCED && from;
    sheet.classList.toggle("flip", !!flip);
    sheet.showModal();
    if (lenis) lenis.stop();
    sheetCard.scrollTop = 0;
    history.replaceState(history.state, "", "#skill-" + slug);
    if (flip) {
      var a = from.getBoundingClientRect();
      var b = sheetCard.getBoundingClientRect();
      G.fromTo(
        sheetCard,
        {
          x: a.left - b.left,
          y: a.top - b.top,
          scaleX: a.width / b.width,
          scaleY: a.height / b.height,
          transformOrigin: "0 0",
          opacity: 0.4,
        },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.6, ease: "expo.out", clearProps: "transform,opacity" }
      );
      G.from(".sheet-body > *", { opacity: 0, y: 10, duration: 0.5, stagger: 0.05, delay: 0.18, ease: "power3.out" });
    }
  }

  $("#sheet-close").addEventListener("click", function () {
    sheet.close();
  });
  sheet.addEventListener("click", function (e) {
    if (e.target === sheet) sheet.close();
  });
  sheet.addEventListener("close", function () {
    currentSkill = null;
    if (lenis) lenis.start();
    if (/^#skill-/.test(location.hash)) history.replaceState(history.state, "", location.pathname + location.search);
  });
  afterLang.push(function () {
    if (currentSkill) fillSheet(currentSkill);
  });

  /* ==============================================================
     CONTACT: the address is only ever assembled here.
     ============================================================== */
  var toastEl = $("#toast");
  var toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }
  function copy(text, msg) {
    var done = function () {
      toast(msg || ui().copied);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () {
        toast(ui().copyFail);
      });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        toast(ui().copyFail);
      }
      ta.remove();
    }
  }
  var ADDR = ["jules", "arthus", "klein"].join(".") + "@" + "gmail" + "." + "com";
  $("#mail-btn").setAttribute("href", "mailto:" + ADDR);
  $("#mail-copy").addEventListener("click", function () {
    copy(ADDR);
  });
  $("#discord-copy").addEventListener("click", function () {
    copy("jularthus", ui().copiedDiscord);
  });

  /* ==============================================================
     COMMAND PALETTE: Ctrl/⌘ K or "/".
     ============================================================== */
  (function palette() {
    var dlg = $("#palette");
    var input = $("#pal-input");
    var list = $("#pal-list");
    if (!dlg.showModal) return;
    var items = [];
    var shown = [];
    var sel = 0;

    function build() {
      var u = ui();
      items = [];
      Object.keys(u.sections).forEach(function (id) {
        items.push({ label: u.sections[id], keys: id + " " + D.UI[lang === "fr" ? "en" : "fr"].sections[id], kind: u.pal.section, run: function () {
          scrollToTarget(id);
        } });
      });
      D.PROJECTS.forEach(function (p) {
        items.push({ label: p.name, keys: p.slug + " " + (p.keys || ""), kind: u.pal.project, run: function () {
          scrollToTarget(p.id);
        } });
      });
      $$(".skill").forEach(function (b) {
        items.push({ label: $(".skill-name", b).textContent, kind: u.pal.skill, run: function () {
          scrollToTarget("stack");
          setTimeout(function () {
            openSheet(b.dataset.skill, null);
          }, 700);
        } });
      });
      var A = u.palActions;
      items.push(
        { label: A.lang, kind: u.pal.action, run: function () {
          setLang(lang === "fr" ? "en" : "fr");
        } },
        { label: A.email, kind: u.pal.action, run: function () {
          copy(ADDR);
        } },
        { label: A.discord, kind: u.pal.action, run: function () {
          copy("jularthus", ui().copiedDiscord);
        } },
        { label: A.github, kind: u.pal.action, run: function () {
          window.open("https://github.com/Jularthus", "_blank", "noopener");
        } },
        { label: A.term, kind: u.pal.action, run: function () {
          scrollToTarget("projets");
          setTimeout(function () {
            $("#term-input").focus({ preventScroll: true });
          }, 900);
        } },
        { label: A.top, kind: u.pal.action, run: function () {
          scrollToTarget("top");
        } }
      );
    }

    /* Subsequence match; contiguous runs and word starts score higher. */
    function match(label, q) {
      if (!q) return { score: 0, marks: [] };
      var L = norm(label);
      var marks = [];
      var score = 0;
      var j = 0;
      var prev = -2;
      for (var i = 0; i < L.length && j < q.length; i++) {
        if (L[i] === q[j]) {
          marks.push(i);
          score += i === prev + 1 ? 3 : 1;
          if (i === 0 || /[\s·._-]/.test(L[i - 1])) score += 2;
          prev = i;
          j++;
        }
      }
      return j === q.length ? { score: score, marks: marks } : null;
    }

    function render() {
      var q = norm(input.value.trim());
      shown = items
        .map(function (it, idx) {
          var m = match(it.label, q);
          if (!m && it.keys) {
            /* keyword hit: listed below label hits, nothing highlighted */
            m = match(it.keys, q);
            if (m) m = { score: m.score - 50, marks: [] };
          }
          return m ? { it: it, m: m, idx: idx } : null;
        })
        .filter(Boolean)
        .sort(function (a, b) {
          return b.m.score - a.m.score || a.idx - b.idx;
        });
      sel = 0;
      if (!shown.length) {
        list.innerHTML = '<li class="pal-empty" role="option" aria-disabled="true">' + esc(ui().pal.none) + "</li>";
        input.removeAttribute("aria-activedescendant");
        return;
      }
      list.innerHTML = shown
        .map(function (s, i) {
          var chars = s.it.label.split("");
          var html = chars
            .map(function (c, k) {
              return s.m.marks.indexOf(k) >= 0 ? "<mark>" + esc(c) + "</mark>" : esc(c);
            })
            .join("");
          return '<li id="pal-' + i + '" role="option" aria-selected="' + (i === 0) + '" data-i="' + i + '"><span>' + html + "</span><small>" + esc(s.it.kind) + "</small></li>";
        })
        .join("");
      input.setAttribute("aria-activedescendant", "pal-0");
    }

    function select(i) {
      if (!shown.length) return;
      sel = (i + shown.length) % shown.length;
      $$("li", list).forEach(function (li, k) {
        li.setAttribute("aria-selected", String(k === sel));
      });
      var li = $("#pal-" + sel);
      if (li) li.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", "pal-" + sel);
    }

    function exec(i) {
      var s = shown[i];
      if (!s) return;
      dlg.close();
      setTimeout(s.it.run, 60);
    }

    function open() {
      if (dlg.open) return;
      if (sheet.open) sheet.close();
      build();
      input.value = "";
      render();
      dlg.showModal();
      if (lenis) lenis.stop();
      input.focus();
    }
    window.__openPalette = open;

    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        select(sel + 1);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        select(sel - 1);
        e.preventDefault();
      } else if (e.key === "Enter") {
        exec(sel);
        e.preventDefault();
      }
    });
    list.addEventListener("pointermove", function (e) {
      var li = e.target.closest("li[data-i]");
      if (li && +li.dataset.i !== sel) select(+li.dataset.i);
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li[data-i]");
      if (li) exec(+li.dataset.i);
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () {
      if (lenis && !sheet.open) lenis.start();
    });
    $("#palette-open").addEventListener("click", open);
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "") || (e.target && e.target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dlg.open ? dlg.close() : open();
      } else if (e.key === "/" && !typing && !dlg.open) {
        e.preventDefault();
        open();
      }
    });
  })();

  /* ==============================================================
     MICRO-INTERACTIONS: magnetic buttons, caret cursor, Latios.
     ============================================================== */
  if (G && FINE && !REDUCED) {
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        G.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.22,
          y: (e.clientY - (r.top + r.height / 2)) * 0.32,
          duration: 0.4,
          ease: "power3.out",
        });
      });
      el.addEventListener("pointerleave", function () {
        G.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      });
    });

    var cursor = $("#cursor");
    var xTo = G.quickTo(cursor, "x", { duration: 0.32, ease: "power3" });
    var yTo = G.quickTo(cursor, "y", { duration: 0.32, ease: "power3" });
    var HOT = "a, button, input, .skill, .pcard, .pin-latios, [role=option]";
    window.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType !== "mouse") return;
        xTo(e.clientX);
        yTo(e.clientY);
        cursor.classList.add("on");
        var t = e.target.closest && e.target.closest(HOT);
        cursor.classList.toggle("big", !!t);
      },
      { passive: true }
    );
    document.documentElement.addEventListener("pointerleave", function () {
      cursor.classList.remove("on");
    });
  }

  (function latios() {
    var pin = $("#latios");
    if (!pin) return;
    var sx = 0;
    var sy = 0;
    var dragging = false;
    pin.addEventListener("pointerdown", function (e) {
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      pin.setPointerCapture(e.pointerId);
      pin.classList.add("dragging");
      if (G) G.killTweensOf(pin);
    });
    pin.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var x = e.clientX - sx;
      var y = e.clientY - sy;
      if (G) G.set(pin, { x: x, y: y, rotation: x * 0.08 });
      else pin.style.transform = "translate(" + x + "px," + y + "px)";
    });
    function drop() {
      if (!dragging) return;
      dragging = false;
      pin.classList.remove("dragging");
      if (G && !REDUCED) G.to(pin, { x: 0, y: 0, rotation: 0, duration: 1.4, ease: "elastic.out(1, 0.32)" });
      else if (G) G.set(pin, { x: 0, y: 0, rotation: 0 });
      else pin.style.transform = "";
    }
    pin.addEventListener("pointerup", drop);
    pin.addEventListener("pointercancel", drop);

    /* ↑ ↑ ↓ ↓ ← → ← → B A */
    var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var k = 0;
    document.addEventListener("keydown", function (e) {
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0;
      if (k < KONAMI.length) return;
      k = 0;
      if (!G || REDUCED) return toast("Latios ✦");
      var img = document.createElement("img");
      img.src = $("#latios img").src;
      img.alt = "";
      img.className = "pin latios-fly";
      document.body.appendChild(img);
      var W = window.innerWidth;
      var H = window.innerHeight;
      var o = { p: 0 };
      G.to(o, {
        p: 1,
        duration: 2.8,
        ease: "power1.inOut",
        onUpdate: function () {
          var p = o.p;
          G.set(img, {
            x: -180 + p * (W + 360),
            y: H * 0.55 - Math.sin(p * Math.PI * 2) * H * 0.2,
            rotation: Math.cos(p * Math.PI * 2) * -14 + 8,
          });
        },
        onComplete: function () {
          img.remove();
        },
      });
      toast("Latios ✦");
    });
  })();

  /* ==============================================================
     DEEP LINKS on load: #skill-x opens its sheet, #p-x finds its card.
     ============================================================== */
  window.addEventListener("load", function () {
    refresh();
    var h = location.hash.slice(1);
    if (!h) return;
    var m = h.match(/^skill-(.+)$/);
    if (m && D.SKILLS[m[1]]) {
      scrollToTarget("stack");
      setTimeout(function () {
        openSheet(m[1], null);
      }, 600);
    } else if (document.getElementById(h)) {
      setTimeout(function () {
        scrollToTarget(h);
      }, 100);
    }
  });

  afterLang.push(refresh);
})();
