import path from 'node:path';
import { Jimp } from "jimp";

const args = process.argv.slice(2);

if (args.length < 1) {
    console.error("Expected argument for screenshot to convert");
    process.exit(1);
}

const dashboard = args[0];

const pngPath = path.resolve(import.meta.dirname, `../renders/${dashboard}.png`);
const bmpPath = path.resolve(import.meta.dirname, `../renders/${dashboard}.bmp`);

const image = await Jimp.read(pngPath);

image.greyscale();
image.dither();

await image.write(bmpPath);