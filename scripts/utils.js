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
    const cachePath = path.join(constants.DATACACHE_ABS_PATH, cachePathString);

    // attempt to get cached data first
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
        await writeFileAndMakeDir(cachePath, dataString);
        console.log("New data cached");
    } catch (error) {
        console.error("Error storing data into cache", error);
    }

    return newData;
}

/**
 * Writes the file and creates all directories in path, if it doesn't already exist
 * @param {string or path} filePath 
 * @param {*} data 
 */
export async function writeFileAndMakeDir(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(filePath, data);
    } catch (error) {
        console.error("Error writing file", error);
    }
}

/**
 * In an array of objects, find the object with a specific key/value pair
 * @param {*} arr 
 * @param {*} key 
 * @param {*} value 
 */
export function findObjWithKeyValuePairInArray(arr, key, value) {
    for (const obj of arr) {
        if (!Object.hasOwn(obj, key)) continue;
        if (obj[key] == value) return obj;
    }
    return false;
}

/**
 * Returns a string representing the given instant in the given format
 * @param {Temporal.instant} instant 
 * @param {String} format 
 * 
 * Date format key:
- YYYY: full year (eg 2026)
- YY: last 2 digits of year (eg 26)
- MMMM: full month name (eg August)
- MMM: abbreviated month name (eg Aug)
- MM: 0-padded month number (eg 08)
- M: non-0-padded month number (eg 8)
- DD: 0-padded day of month (eg 07)
- D: non-0-padded day of month (eg 7)
- dddd: full day of week name (eg Saturday)
- ddd: abbreviated day of week name (eg Sat)
- dd: extra abbreviated day of week name (eg Sa)

Time format key:
- HH: 0-padded hour (24 hour) (eg 13)
- H: non-0-padded hour (24 hour)
- hh: 0-padded hour (12 hour) (eg 07)
- h: non-0-padded hour (12 hour) (eg 7)
- mm: minutes
- pp: am or pm
- PP: AM or PM
 */
export function getZonedTimeStringFromInstant(instant, format) {
    const zonedTime = instant.toZonedDateTimeISO(constants.TIMEZONE);

    const months = {
        long: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        short: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]
    }

    const daysOfWeek = {
        long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        shorter: ["Su", "M", "T", "W", "Th", "F", "Sa"]
    }

    const formatTimeMap = {
        YYYY: zonedTime.year,
        YY: zonedTime.year % 100,
        MMMM: months.long[zonedTime.month - 1],
        MMM: months.short[zonedTime.month - 1],
        MM: String(zonedTime.month).padStart(2, "0"),
        M: zonedTime.month,
        DD: String(zonedTime.day).padStart(2, "0"),
        D: zonedTime.day,
        dddd: daysOfWeek.long[zonedTime.daysOfWeek % 7],
        ddd: daysOfWeek.short[zonedTime.daysOfWeek % 7],
        dd: daysOfWeek.shorter[zonedTime.daysOfWeek % 7],

        HH: String(zonedTime.hour).padStart(2, "0"),
        H: zonedTime.hour,
        hh: String(format12hour(zonedTime.hour)).padStart(2, "0"),
        h: format12hour(zonedTime.hour),
        mm: String(zonedTime.minute).padStart(2, "0"),
        pp: (zonedTime.hour >= 12 ? "pm" : "am"),
        PP: (zonedTime.hour >= 12 ? "pm" : "am").toUpperCase()
    }

    let t = format.replace(/Y{2}|Y{4}|M{1,4}|D{1,2}|d{2,4}|H{1,2}|h{1,2}|mm|pp|PP/g, (matched) => formatTimeMap[matched]);
    return t;

    function format12hour(hh) {
        hh = hh % 12;
        if (hh == 0) {
            hh = 12;
        }
        return hh;
    }

}