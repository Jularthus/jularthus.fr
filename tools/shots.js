const { chromium } = require("playwright");
const out = process.argv[2];
const targets = [
  ["home", "https://home.jularthus.fr/", "light"],
  ["beers", "https://beers.jularthus.fr/?demo=1", "light"],
  ["aucoin", "https://aucoin.jularthus.fr/", "light"],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, url, scheme] of targets) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: scheme, deviceScaleFactor: 1 });
    try { await p.goto(url, { waitUntil: "networkidle", timeout: 20000 }); } catch (e) { console.log(name, "goto:", e.message.split("\n")[0]); }
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${name}.png` });
    console.log(name, "ok", await p.title());
    await p.close();
  }
  await b.close();
})();
