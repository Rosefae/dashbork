// No API for fetching this info. Relevant CSVs will need to be manually downloaded once per quarter, then run this script to parse it

import * as fs from "node:fs";
import * as path from "node:path";
import { parse as csvParse } from "csv-parse/sync";

import * as constants from "../constants.js";
import * as utils from "../utils.js";

const pathToData = path.join(process.cwd(), "data_for_manual_import/stm");
const fileStorePath = path.join(constants.DATACACHE_ABS_PATH, "stm-info.json");

const [directions, routes, stops] = await Promise.all([
    parseCSV("directions.csv"),
    parseCSV("routes.csv"),
    parseCSV("stops.csv")
]);

let formattedRoutes = {};

routes.forEach((route) => {
    if (route.route_type == "1") return;
    const formatted = {
        route_short_name: route.route_short_name,
        route_color: route.route_color,
        route_text_color: route.route_text_color,
        directions: {}
    }
    formattedRoutes[route.route_id] = formatted;
});

directions.forEach((direction) => {
    let route = formattedRoutes[direction.route_id];
    if (!route) return;
    route.directions[direction.direction_id] = direction.direction;
});

let formattedStops = {};

stops.forEach((stop) => {
    formattedStops[stop.stop_id] = stop.stop_name
});

try {
    const dataString = JSON.stringify({
        routes: formattedRoutes,
        stops: formattedStops
    });
    await utils.writeFileAndMakeDir(fileStorePath, dataString);
} catch (error) {
    console.error("Error storing data to file");
}

async function parseCSV(filename) {
    try {
        const content = await fs.promises.readFile(path.join(pathToData, filename));
        const records = csvParse(content, {
            bom: true,
            columns: true
        });

        return records;
    }
    catch (error) {
        console.error(`Error reading ${filename}`, error);
    }   
}