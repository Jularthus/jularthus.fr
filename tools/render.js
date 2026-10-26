// Renders the share image (og.jpg) and the touch icon from the HTML
// templates in render/, straight into public/.
// Usage: node render.js
const { chromium } = require("playwright");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const tpl = (f) => "file://" + path.join(__dirname, "render", f);

(async () => {
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto(tpl("og.html"));
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(PUBLIC, "og.jpg"), type: "jpeg", quality: 86 });

  p = await b.newPage({ viewport: { width: 180, height: 180 } });
  await p.goto(tpl("icon.html"));
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(PUBLIC, "apple-touch-icon.png") });

  await b.close();
  console.log("wrote public/og.jpg and public/apple-touch-icon.png");
})();
