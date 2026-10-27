// Screenshots of the ACDC / YAKA block after it has fully revealed.
const { chromium } = require("playwright");
require("fs").mkdirSync(__dirname + "/out", { recursive: true });
const runs = [
  ["fr-light", { width: 1440, height: 900 }, "fr-FR", "light"],
  ["en-dark", { width: 1440, height: 900 }, "en-US", "dark"],
  ["fr-mobile", { width: 390, height: 844 }, "fr-FR", "light"],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, vp, locale, scheme] of runs) {
    const p = await b.newPage({ viewport: vp, locale, colorScheme: scheme });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errs.push(m.text()));
    await p.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    // scroll through the block so reveals, the line and the counter all play
    const top = await p.evaluate(() => document.getElementById("duo").getBoundingClientRect().top + scrollY);
    const h = await p.evaluate(() => document.getElementById("duo").offsetHeight);
    for (let y = top - vp.height; y <= top + h; y += 120) {
      await p.evaluate((y) => scrollTo(0, y), y);
      await p.waitForTimeout(60);
    }
    await p.evaluate((y) => scrollTo(0, y), top - 140);
    await p.waitForTimeout(2600);
    const box = await p.evaluate(() => {
      const r = document.querySelector(".duo").getBoundingClientRect();
      const t = document.querySelector("#duo").previousElementSibling.getBoundingClientRect();
      return { x: 0, y: t.top + scrollY - 20, width: innerWidth, height: r.bottom - t.top + 60 };
    });
    await p.screenshot({ path: `${__dirname}/out/duo-${name}.png`, fullPage: true, clip: box });
    const info = await p.evaluate(() => ({
      count: document.querySelector(".duo-stat .count").textContent,
      line: getComputedStyle(document.querySelector(".duo-line")).transform,
      yaka: document.getElementById("yaka-name").textContent,
    }));
    console.log(name, JSON.stringify(info), errs.join(" | "));
    await p.close();
  }
  await b.close();
})();
