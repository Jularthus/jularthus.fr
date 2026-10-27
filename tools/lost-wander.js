// Follow Mew for a while: does it sit, wander on screen, land, and teleport mid-flight?
const { chromium } = require("playwright");
require("fs").mkdirSync(__dirname + "/out", { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, vp] of [["desk", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp });
    await p.addInitScript(() => { window.__forceGL = true; });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto("http://127.0.0.1:8787/somewhere", { waitUntil: "networkidle" });
    await p.mouse.move(vp.width - 5, vp.height - 5);
    const box = () => p.evaluate(() => { const r = document.getElementById("mew").getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), rot: getComputedStyle(document.getElementById("mew")).rotate }; });
    const samples = [];
    let shot = 0;
    for (let i = 0; i < 52; i++) {
      await p.waitForTimeout(500);
      const s = await box();
      samples.push(s);
      if (name === "desk" && shot < 3 && i > 4 && samples.length > 1 && Math.abs(s.x - samples[samples.length - 2].x) > 8) {
        await p.evaluate(() => document.getElementById("mew").style.setProperty("--t", "1"));
        await p.screenshot({ path: `${__dirname}/out/wander-${shot++}.png` });
      }
    }
    const moved = samples.some((s, i) => i && Math.hypot(s.x - samples[i - 1].x, s.y - samples[i - 1].y) > 5);
    const offscreen = samples.filter((s) => s.x < -10 || s.y < -10 || s.r > vp.width + 10 || s.b > vp.height + 10).length;
    const distinct = new Set(samples.map((s) => Math.round(s.x / 40) + ":" + Math.round(s.y / 40))).size;
    // click while flying (wait for movement first)
    let flyingClick = "no flight caught";
    for (let i = 0; i < 40; i++) {
      const a = await box(); await p.waitForTimeout(150); const c = await box();
      if (Math.hypot(a.x - c.x, a.y - c.y) > 3) {
        await p.mouse.click((c.x + c.r) / 2, (c.y + c.b) / 2);
        await p.waitForTimeout(900);
        const d1 = await box(); await p.waitForTimeout(600); const d2 = await box();
        flyingClick = Math.hypot(d1.x - d2.x, d1.y - d2.y) < 2 ? "teleported and sitting" : "still moving after click";
        break;
      }
      await p.waitForTimeout(300);
    }
    console.log(name, "| moved:", moved, "| distinct spots:", distinct, "| off-screen samples:", offscreen, "| click mid-flight:", flyingClick, "| errors:", errs.join(";") || "none");
    await p.close();
  }
  // reduced motion: must never wander
  const r = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await r.goto("http://127.0.0.1:8787/somewhere", { waitUntil: "networkidle" });
  await r.waitForTimeout(1000);
  const a = await r.evaluate(() => document.getElementById("mew").getBoundingClientRect().left);
  await r.waitForTimeout(14000);
  const c = await r.evaluate(() => document.getElementById("mew").getBoundingClientRect().left);
  console.log("reduced motion | stayed put:", Math.abs(a - c) < 1);
  await b.close();
})();
