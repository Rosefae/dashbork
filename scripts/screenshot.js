import path from 'node:path';
import puppeteer from "puppeteer";

const args = process.argv.slice(2);

if (args.length < 3) {
    console.error("Expected three arguments (dashboard name, viewport width, viewport height).");
    process.exit(1);
}

const dashboard = args[0];
const vwidth = parseInt(args[1]);
const vheight = parseInt(args[2]);

const pagePath = path.resolve(import.meta.dirname, `../pages/boards/${dashboard}/index.html`);
const screenshotPath = path.resolve(import.meta.dirname, `../renders/${dashboard}.png`);

console.log(pagePath);

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setViewport({ width: vwidth, height: vheight });

await page.goto(`file://${pagePath}`, {
    waitUntil: 'networkidle2',
});

await page.screenshot({
    path: screenshotPath
});

await browser.close();
