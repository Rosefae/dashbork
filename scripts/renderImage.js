import path from 'node:path';
import puppeteer from "puppeteer";
import { Jimp } from "jimp";

import * as constants from "./constants.js";
import * as utils from "./utils.js";

const PORT = constants.PORT;

export async function renderImage(dashboard, viewportWidth, viewportHeight, isGrayscale = false, imgFormat = "png") {
    const screenshot = await createScreenshot(dashboard, viewportWidth, viewportHeight);
    console.log("Done initial render");

    // if grayscale or other image format, process
    return screenshot;
}

async function createScreenshot(dashboard, viewportWidth, viewportHeight) {
    const screenshotFilename = `${dashboard}_${viewportWidth}x${viewportHeight}.png`;
    const screenshotPath = path.join(constants.RENDERS_ABS_PATH, screenshotFilename);
    const dashboardUrl = `${constants.DASHBOARDS_LOCAL_URL}/${dashboard}.html`;
    const screenshotLocalUrl = `${constants.RENDERS_LOCAL_URL}/${screenshotFilename}`;
    const screenshotPublicUrl = `${constants.RENDERS_PUBLIC_URL}/${screenshotFilename}`;

    let browser;
    try {
        console.log("Launching puppeteer...")
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        console.log(`Setting viewport: ${viewportWidth}x${viewportHeight}`);
        await page.setViewport({ width: viewportWidth, height: viewportHeight });

        console.log(`Accessing page ${dashboardUrl}`);
        await page.goto(dashboardUrl, {
            waitUntil: 'networkidle0',
        });

        console.log("Taking screenshot...")
        await page.screenshot({
            path: screenshotPath
        });

        return {
            path: screenshotPath,
            localUrl: screenshotLocalUrl,
            publicUrl: screenshotPublicUrl
        };
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

// async function convertForTrmnl(sourceFilename, isGrayscale, destFilename) {
//     // https://docs.trmnl.com/go/diy/imagemagick-guide
//     const pngPath = path.join(constants.RENDERS_PATH, `${sourceFilename}.png`);
//     const bmpPath = path.join(constants.RENDERS_PATH, `${destFilename}.bmp`);;
    
//     const image = await Jimp.read(pngPath);
    
//     if (isGrayscale) {
//         image.greyscale();
//         image.dither();
//     }
    
//     await image.write(bmpPath);

//     // return url to new bmp
//     return `${constants.RENDERS_URL}/${destFilename}.bmp`;
// }