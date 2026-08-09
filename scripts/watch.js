// Because I added a server, use this this instead of 11ty's built-in watch

import * as fs from "node:fs";
import * as path from "node:path";
import { exec } from "node:child_process";

const TRIGGER_COMMAND = "npm run build";

console.log("Watching for changes...");

const thingsToWatch = [
    path.join(process.cwd(), "./src"),
    path.join(process.cwd(), ".eleventy.js")
]

const doOnWatch = (eventType, filename) => {
    if (!filename) return;

    console.log(`File changed: ${filename}`);
    console.log(`Rebuilding...`);

    exec(TRIGGER_COMMAND, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error while building: ${err.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(stdout);
    });
}

for (const thing of thingsToWatch) {
    fs.watch(thing, { recursive: true }, doOnWatch);
}