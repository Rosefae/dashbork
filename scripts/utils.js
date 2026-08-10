import * as fs from "node:fs";
import * as path from "node:path";

import * as constants from "./constants.js";

/**
 * Returns cached data, or if it's stale, returns new data and caches it
 * @param {string} cachePathString - path to the cache file, relative to project root
 * @param {int} millisecondsUntilStale - number of milliseconds before data is considered stale
 * @param {function} getNewDataFunction - async function to run that will fetch the new data
 * @returns {object} data to be fetched
 */
export async function handleCachedData(cachePathString, millisecondsUntilStale, getNewDataFunction) {
    const cachePath = path.join(process.cwd(), cachePathString);

    // attempt to get cached data first
    let cachedData = {}

    try {
        console.log(`Attempting to get data from ${cachePathString}`);
        const raw = await fs.promises.readFile(cachePath);
        const cachedData = JSON.parse(raw);
        if (!cachedData.data) throw new Error("Could not find data in cached file");
        if (!cachedData.lastFetched) throw new Error("Could not find last fetched time");

        if (Temporal.Now.instant().epochMilliseconds - cachedData.lastFetched < millisecondsUntilStale) {
            // Cached data sufficiently fresh
            console.log("Serving cached data");
            return cachedData.data;
        }
        console.log("Cached data too old");
    } catch (error) {
        console.error("Error reading cached data", error);
    }

    // fetch new data as cached data was not returned
    const newTime = Temporal.Now.instant().epochMilliseconds;
    console.log("Fetching new data instead...");
    const newData = await getNewDataFunction();

    // write new data to cache
    try {
        console.log("Writing new data to cache file...");
        const dataString = JSON.stringify({
            lastFetched: newTime,
            data: newData
        });
        await fs.promises.writeFile(cachePath, dataString);
        console.log("New data cached");
    } catch (error) {
        console.error("Error storing data into cache", error);
    }

    return newData;
}

