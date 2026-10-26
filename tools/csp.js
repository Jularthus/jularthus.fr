const { chromium } = require("playwright");
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const v = [];
  p.on("console", m => { if (/Content Security Policy|Refused/i.test(m.text())) v.push(m.text().slice(0, 200)); });
  p.on("pageerror", e => v.push("pageerror " + e.message));
  await p.route("**/*", async route => {
    const r = await route.fetch();
    const h = { ...r.headers() };
    if (route.request().resourceType() === "document") h["content-security-policy"] = CSP;
    route.fulfill({ response: r, headers: h });
  });
  await p.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  for (let y = 0; y < 12000; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
  await p.click('[data-set-lang="en"]'); await p.waitForTimeout(500);
  await p.keyboard.press("Control+k"); await p.waitForTimeout(300); await p.keyboard.press("Escape");
  console.log("CSP violations:", v.length ? v : "none");
  await b.close();
})();
