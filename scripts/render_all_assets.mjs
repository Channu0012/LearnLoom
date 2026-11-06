import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PUBLIC_DIR = path.resolve("public");

async function main() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch();
  
  // 1. Render icon.png (512x512)
  console.log("Rendering icon.png (512x512)...");
  const iconPage = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  const iconSvg = fs.readFileSync(path.join(PUBLIC_DIR, "icon.svg"), "utf-8");
  await iconPage.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:transparent; overflow:hidden;">
        ${iconSvg}
      </body>
    </html>
  `);
  await iconPage.screenshot({ path: path.join(PUBLIC_DIR, "icon.png"), omitBackground: true });

  // 2. Render logo.png (798x220)
  console.log("Rendering logo.png (798x220)...");
  const logoPage = await browser.newPage({ viewport: { width: 798, height: 220 }, deviceScaleFactor: 2 });
  const logoSvg = fs.readFileSync(path.join(PUBLIC_DIR, "logo.svg"), "utf-8");
  await logoPage.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:transparent; overflow:hidden;">
        ${logoSvg}
      </body>
    </html>
  `);
  await logoPage.screenshot({ path: path.join(PUBLIC_DIR, "logo.png"), omitBackground: true });

  await browser.close();
  console.log("Master renders complete! Now generating multi-size favicons and PWA icons via Python Pillow...");

  // Run python script to produce icon-192, icon-maskable, apple-touch-icon, favicon.ico, favicon.png
  execSync("python scripts/generate_pwa_icons.py", { stdio: "inherit" });
  console.log("All brand assets successfully generated!");
}

main().catch(err => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
