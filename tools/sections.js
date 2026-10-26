const { chromium } = require("playwright");
require("fs").mkdirSync(__dirname + "/out", { recursive: true });
const BASE = process.argv[2] || "http://127.0.0.1:8787/";
const W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900);
const tag = process.argv[5] || "s";
const scheme = process.argv[6] || "light";
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: W, height: H }, colorScheme: scheme, locale: "fr-FR" });
  await p.addInitScript(() => { window.__forceGL = true; });
  p.on("pageerror", e => console.log("pageerror", e.message));
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: `${__dirname}/out/${tag}-0-hero.png` });
  const ids = (process.argv[7] || "a-propos,projets,selection,parcours,stack,contact").split(",");
  for (const id of ids) {
    const [sel, extra] = id.split("+");
    const y = await p.evaluate(([s, extra]) => {
      const el = document.getElementById(s);
      const st = window.ScrollTrigger && ScrollTrigger.getAll().find(t => t.pin && t.trigger && t.trigger.closest("#" + s));
      if (st && extra) return st.start + (st.end - st.start) * (+extra);
      return el.getBoundingClientRect().top + window.scrollY - 60;
    }, [sel, extra]);
    // step there so scroll-driven things update
    const cur = await p.evaluate(() => window.scrollY);
    const steps = 8;
    for (let i = 1; i <= steps; i++) { await p.evaluate(v => window.scrollTo(0, v), cur + (y - cur) * i / steps); await p.waitForTimeout(80); }
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${__dirname}/out/${tag}-${id.replace("+", "_")}.png` });
  }
  await b.close();
})();
