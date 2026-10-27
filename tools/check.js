// Portfolio checks: screenshots, console errors, horizontal scroll,
// em dash scan (FR + EN), reduced motion, no-JS.
// Usage: node check.js [baseURL] [outDir]
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || "http://127.0.0.1:8787/";
const OUT = process.argv[3] || __dirname + "/out";
fs.mkdirSync(OUT, { recursive: true });

async function crawl(p) {
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(800);
}

(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const report = [];
  const runs = [
    { name: "desk-light", vp: { width: 1440, height: 900 }, scheme: "light" },
    { name: "desk-dark", vp: { width: 1440, height: 900 }, scheme: "dark" },
    { name: "tablet", vp: { width: 768, height: 1024 }, scheme: "light" },
    { name: "mobile", vp: { width: 390, height: 844 }, scheme: "light", mobile: true },
    { name: "reduced", vp: { width: 1440, height: 900 }, scheme: "light", reduced: true },
    { name: "nojs", vp: { width: 1440, height: 900 }, scheme: "light", nojs: true },
  ];
  for (const r of runs) {
    const ctx = await b.newContext({
      viewport: r.vp,
      colorScheme: r.scheme,
      reducedMotion: r.reduced ? "reduce" : "no-preference",
      javaScriptEnabled: !r.nojs,
      isMobile: !!r.mobile,
      hasTouch: !!r.mobile,
      locale: "fr-FR",
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    await p.goto(BASE, { waitUntil: "networkidle" });
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${OUT}/${r.name}-hero.png` });
    await crawl(p);
    const hscroll = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const wide = await p.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return b.right > window.innerWidth + 1 && getComputedStyle(e).position !== "fixed" && !e.closest(".gallery-track, .nav-links, .sel-pin");
        })
        .slice(0, 5)
        .map((e) => e.tagName + "." + e.className)
    );
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${r.name}-full.png`, fullPage: true });
    const dash = await p.evaluate(() => {
      const t = document.body.innerText + document.title + [...document.querySelectorAll("meta[content]")].map((m) => m.content).join(" ");
      return (t.match(/.{0,30}—.{0,30}/g) || []).slice(0, 5);
    });
    report.push({ run: r.name, errors: errs, hscroll, wide, emdash: dash });
    await ctx.close();
  }

  // English pass: toggle, check strings and em dashes, including generated content.
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    await p.goto(BASE, { waitUntil: "networkidle" });
    await p.waitForTimeout(2600);
    const lang = await p.evaluate(() => document.documentElement.lang);
    await crawl(p);
    await p.screenshot({ path: `${OUT}/en-hero.png` });
    // open each skill sheet and collect text
    const sheetText = await p.evaluate(async () => {
      let all = "";
      for (const b of document.querySelectorAll(".skill")) {
        b.click();
        await new Promise((r) => setTimeout(r, 80));
        all += document.getElementById("sheet").innerText + "\n";
        document.getElementById("sheet").close();
      }
      return all;
    });
    const t = await p.evaluate(() => document.body.innerText + document.title);
    const frLeft = (t.match(/\b(Qui je suis|Le parcours|Voir les projets|comment je l'ai appris|Écrire un e-mail)\b/g) || []);
    const dash = ((t + sheetText).match(/.{0,30}—.{0,30}/g) || []).slice(0, 5);
    // FR sheets too
    await p.click('[data-set-lang="fr"]');
    await p.waitForTimeout(600);
    const frSheet = await p.evaluate(async () => {
      let all = "";
      for (const b of document.querySelectorAll(".skill")) {
        b.click();
        await new Promise((r) => setTimeout(r, 80));
        all += document.getElementById("sheet").innerText + "\n";
        document.getElementById("sheet").close();
      }
      return all;
    });
    const frDash = (frSheet.match(/.{0,30}—.{0,30}/g) || []).slice(0, 5);
    report.push({ run: "english", autoLang: lang, errors: errs, frenchLeftInEN: frLeft, emdash: dash, frSheetEmdash: frDash });
    await ctx.close();
  }
  // Language round trip: switch after every animation has played (titles
  // split and rebuilt, decrypts done), then compare with a fresh load.
  {
    const SEL = "h1, h2, h3, h4, nav a, .eyebrow, .tl-period, .band-note, .rule-note, .proof dd, .skill-name, .pcard-pitch, .duo-when, .duo-sub, .duo-list li, .duo-seal, .relay-cap, .relay-years span";
    const texts = (p) => p.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => e.innerText.trim()), SEL);
    for (const [from, to] of [["fr", "en"], ["en", "fr"]]) {
      const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: from === "fr" ? "fr-FR" : "en-US" });
      const p = await ctx.newPage();
      const errs = [];
      p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
      p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errs.push(m.text()));
      await p.goto(BASE, { waitUntil: "networkidle" });
      await p.waitForTimeout(2600);
      await crawl(p);
      await p.waitForTimeout(1500);
      await p.click(`[data-set-lang="${to}"]`);
      await p.waitForTimeout(800);
      const switched = await texts(p);
      const fresh = await ctx.newPage();
      await fresh.goto(BASE + "?lang=" + to, { waitUntil: "networkidle" });
      await fresh.waitForTimeout(2600);
      await crawl(fresh);
      await fresh.waitForTimeout(1500);
      const expected = await texts(fresh);
      const diffs = switched.map((t, i) => (t !== expected[i] ? `${JSON.stringify(t)} != ${JSON.stringify(expected[i])}` : null)).filter(Boolean);
      report.push({ run: `switch ${from}->${to}`, errors: errs, mismatches: diffs.slice(0, 8) });
      await ctx.close();
    }
  }
  // The 404 page: real 404 status, complete in both languages, with
  // reduced motion and without JS, no errors, no em dashes.
  for (const [name, opts] of [
    ["404 fr", { locale: "fr-FR" }],
    ["404 en", { locale: "en-US" }],
    ["404 reduced", { locale: "fr-FR", reducedMotion: "reduce" }],
    ["404 nojs", { locale: "fr-FR", javaScriptEnabled: false }],
    ["404 mobile", { locale: "fr-FR", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    p.on("console", (m) => m.type() === "error" && !/status of 404/.test(m.text()) && errs.push(m.text()));
    const res = await p.goto(BASE + "nowhere/at/all", { waitUntil: "networkidle" });
    await p.waitForTimeout(2200);
    const info = await p.evaluate(() => ({
      text: document.body.innerText.replace(/\s+/g, " ").trim(),
      title: document.title,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }));
    const problems = [];
    if (res.status() !== 404) problems.push("status " + res.status());
    if (!/404/.test(info.text)) problems.push("no 404 shown");
    if (!/(volatilis|vanished)/.test(info.text)) problems.push("message missing");
    if (/—/.test(info.text + info.title)) problems.push("em dash");
    if (info.overflow > 0) problems.push("horizontal scroll");
    report.push({ run: name, errors: errs, problems, text: problems.length ? info.text.slice(0, 120) : undefined });
    await ctx.close();
  }

  await b.close();
  console.log(JSON.stringify(report, null, 1));
})();
