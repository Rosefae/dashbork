import * as constants from "../constants.js";
import * as utils from "../utils.js";

import * as weather from "./weather.js";
import * as bixi from "./bixi.js";
import * as stm from "./stm.js";

export function beginFetchAll() {
    console.log("Beginning to repeatedly fetch new data at regular intervals");

    fetchBixi();
    const bixiInterval = setInterval(fetchBixi, bixi.DATA_TIME_INTERVAL);

    fetchWeather();
    const weatherInvterval = setInterval(fetchWeather, weather.DATA_TIME_INTERVAL);

    fetchStm();
    const stmInterval = setInterval(fetchStm, stm.DATA_TIME_INTERVAL);
}

function fetchWeather() {
    console.log("[from _fetchall] Fetching new weather data");
    weather.PLACES_TO_CARE_ABOUT.forEach((place) => {
        const cacheString = weather.getCacheString(place.latitude, place.longitude);
        utils.acquireNewDataAndCache(cacheString, async () => {
            return await weather.fetchNewData(place.latitude, place.longitude);
        });
    });
}

function fetchBixi() {
    console.log("[from _fetchall] Fetching new bixi data");
    utils.acquireNewDataAndCache(bixi.CACHE_FILE_NAME, bixi.fetchNewData);
}

function fetchStm() {
    console.log("[from _fetchall] Fetching new STM data");
    utils.acquireNewDataAndCache(stm.SCHEDULE_CACHE_FILE_NAME, stm.fetchNewScheduleData);
    utils.acquireNewDataAndCache(stm.STATUS_CACHE_FILE_NAME, stm.fetchNewStatusData);
}