// Visit each of Mew's perches and check it never covers the text.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, vp, mobile] of [["desk", { width: 1440, height: 900 }, false], ["mobile", { width: 390, height: 844 }, true]]) {
    const p = await b.newPage({ viewport: vp, isMobile: mobile, hasTouch: mobile, locale: "fr-FR" });
    await p.addInitScript(() => { window.__forceGL = true; });
    await p.goto("http://127.0.0.1:8787/projets/secret-mew", { waitUntil: "networkidle" });
    await p.waitForTimeout(3000);
    for (let i = 0; i < 3; i++) {
      const hit = await p.evaluate(() => {
        const m = document.getElementById("mew").getBoundingClientRect();
        const pad = 6; // ignore the transparent margin of the sprite
        const over = (el) => { const r = el.getBoundingClientRect(); return !(m.right - pad < r.left || r.right < m.left + pad || m.bottom - pad < r.top || r.bottom < m.top + pad); };
        return ["lost-path", "lost-line", "lost-home"].filter((id) => over(document.getElementById(id)));
      });
      await p.evaluate(() => document.getElementById("mew").style.setProperty("--t", "1"));
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${__dirname}/out/404-perch${i}-${name}.png` });
      console.log(name, "perch", i, "covers:", hit.length ? hit : "nothing");
      if (mobile) await p.tap("#mew"); else await p.click("#mew");
      await p.waitForTimeout(900);
    }
    await p.close();
  }
  await b.close();
})();
