const { chromium } = require("playwright");
require("fs").mkdirSync(__dirname + "/out", { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: "fr-FR" });
  p.on("pageerror", e => console.log("pageerror", e.message));
  await p.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await p.evaluate(() => { const t = document.getElementById("term"); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 150); });
  await p.waitForFunction(() => !document.getElementById("term-form").hasAttribute("aria-disabled"), null, { timeout: 30000 });
  await p.click("#term-input");
  for (const c of ["help", "neofetch", "ls", "sudo rm -rf /"]) { await p.keyboard.type(c, { delay: 20 }); await p.keyboard.press("Enter"); await p.waitForTimeout(250); }
  await p.keyboard.type("ca"); await p.keyboard.press("Tab"); await p.keyboard.type("dev"); await p.keyboard.press("Tab");
  console.log("tab-completed:", await p.inputValue("#term-input"));
  await p.screenshot({ path: __dirname + "/out/term.png" });
  await p.keyboard.press("Enter"); await p.waitForTimeout(2500);
  console.log("after cat, card in view:", await p.evaluate(() => { const r = document.getElementById("p-devdocker").getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }));
  // palette
  await p.keyboard.press("Escape");
  await p.keyboard.press("Control+k"); await p.waitForTimeout(300);
  await p.keyboard.type("beer"); await p.waitForTimeout(200); console.log("palette items:", await p.evaluate(() => [...document.querySelectorAll("#pal-list li")].map(l => l.textContent).slice(0,3)));
  await p.screenshot({ path: __dirname + "/out/palette.png" });
  await p.keyboard.press("Enter"); await p.waitForTimeout(2500);
  console.log("after palette beers:", await p.evaluate(() => { const r = document.getElementById("p-beers").getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), innerWidth]; }));
  // skill sheet
  await p.evaluate(() => document.querySelector('.skill[data-skill="secu"]').scrollIntoView());
  await p.waitForTimeout(1200);
  await p.click('.skill[data-skill="secu"]'); await p.waitForTimeout(900);
  console.log("hash:", await p.evaluate(() => location.hash), "focus:", await p.evaluate(() => document.activeElement.id || document.activeElement.className));
  await p.screenshot({ path: __dirname + "/out/sheet.png" });
  await p.keyboard.press("Tab"); await p.keyboard.press("Tab"); await p.keyboard.press("Tab");
  console.log("focus stays in dialog:", await p.evaluate(() => !!document.activeElement.closest("dialog")));
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  console.log("closed:", await p.evaluate(() => !document.getElementById("sheet").open), "focus back:", await p.evaluate(() => document.activeElement.dataset.skill));
  // language toggle
  await p.click('[data-set-lang="en"]'); await p.waitForTimeout(800);
  console.log("lang:", await p.evaluate(() => [document.documentElement.lang, document.title, document.querySelector("#stack-title").textContent]));
  await b.close();
})();
