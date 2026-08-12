import * as path from "node:path";
import * as fs from "node:fs";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

import * as constants from "../constants.js";
import * as utils from "../utils.js";
import { fstat } from "node:fs";

const GTFS_URL = "https://api.stm.info/pub/od/gtfs-rt/ic/v2/tripUpdates",
    STATUS_URL = "https://api.stm.info/pub/od/i3/v2/messages/etatservice";

const API_KEY = process.env.STM_API_KEY,
    FETCH_HEADER = {
        headers: {
            "apiKey": API_KEY
        }
    };

const MILLISECONDS_UNTIL_STALE = (1000000 /* DEBUGGING NUMBER */) * 60 * 1000; // 1 minute

async function fetchNewScheduleData() {
    console.log("Fetching new STM schedule data");

    try {
        const response = await fetch(GTFS_URL, FETCH_HEADER);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        console.log("Fetched new STM schedule data. Parsing...");
        return await parseProtobufResponse(response);
    }
    catch (error) {
        console.log("Error fetching new STM schedule data", error);
    }
}

async function fetchNewStatusData() {
    console.log("Fetching new STM status data");

    try {
        const response = await fetch(STATUS_URL, FETCH_HEADER);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        console.log("Fetched new STM status data. Parsing...");
        return await response.json();
    }
    catch (error) {
        console.log("Error fetching new STM status data", error);
    }
}

async function parseProtobufResponse(response) {
    const buffer = await response.arrayBuffer();
    console.log("Data received. Decoding...");
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
    );

    let tripUpdates = [];
    feed.entity.forEach((entity) => {
        if (entity.tripUpdate) {
            tripUpdates.push(entity.tripUpdate);
        }
    });

    return tripUpdates;
}

function processGtfsData(gtfsData, stopIds, numBuses, maxMinutes, staticInfo) {
    console.log("Looking through live info for requested stops...");

    let result = {};
    let stopIdStrs = stopIds.map((stopId) => {
        let s = String(stopId);
        result[s] = {
            name: staticInfo.stops[s],
            buses: {}
        };
        return s;
    });

    const now = Temporal.Now.instant();
    console.log(maxMinutes);
    // const maxDuration = new Temporal.Duration(minutes = maxMinutes);

    for (const tripData of gtfsData) {
        if (tripData.trip.scheduleRelationship == "CANCELED") continue; 
        if (!tripData.stopTimeUpdate) continue;

        console.log(tripData.trip.tripId);
        const routeId = tripData.trip.routeId;

        for (const stop of tripData.stopTimeUpdate) {
            if (!stopIdStrs.includes(stop.stopId)) continue;
            if (stop.scheduleRelationship == "SKIPPED") continue;
            if (!stop.departure) continue;

            let busesAtStop = result[stop.stopId].buses;
            if (!Object.hasOwn(busesAtStop, routeId)) {
                busesAtStop[routeId] = [];
            }

            if (busesAtStop[routeId].length > numBuses) continue;

            const stopTimeEpochSeconds = stop.departure.time;
            if (!stopTimeEpochSeconds) continue;

            const stopTime = Temporal.Instant.fromEpochMilliseconds(stopTimeEpochSeconds * 1000);
            const timeUntil = now.until(stopTime, { smallestUnit: "minutes" });
            // if (timeUntil.sign <= 0) continue;
            // if (Temporal.compare(timeUntil, maxDuration) > 0) continue;

            const stopTimeString = utils.getZonedTimeStringFromInstant(stopTime, "h:mm PP"); // todo: get format from params

            const routeInfo = staticInfo.routes[tripData.trip.routeId];

            busesAtStop[routeId].push({
                route: routeInfo.route_short_name,
                direction: routeInfo.directions[tripData.trip.directionId],
                time: stopTimeString,
                minutesUntil: timeUntil.minutes
            });
        }
    }

    return result;
}

function processStatusData(statusData, stopIds) {
    console.log("Searching for relevant status messages...");
    const now = Temporal.Now.instant().epochMilliseconds / 1000; // epochSeconds

    const result = {};

    statusData.alerts.forEach((a) => {
        // check active periods
        if (a.active_periods.start > now) return;
        if (a.active_periods.end != null && a.active_periods.end <= now) return;

        // check if any of the stopIds match the stop_ids the alert is issued for
        let relevantStops = stopIds.filter((stopId) => {
            return utils.findObjWithKeyValuePairInArray(a.informed_entities, "stop_code", stopId)
        });
        if (relevantStops.length <= 0) return;
        
        // pass on english header and description texts. fallback to french
        let heading = utils.findObjWithKeyValuePairInArray(a.header_texts, "language", "en");
        if (heading.text == null) {
            heading = utils.findObjWithKeyValuePairInArray(a.header_texts, "language", "fr");
        }
        let description = utils.findObjWithKeyValuePairInArray(a.description_texts, "language", "en");
        if (description.text == null) {
            description = utils.findObjWithKeyValuePairInArray(a.description_texts, "language", "fr");
        }

        const alertMsg = {
            heading: heading.text,
            description: description.text
        }

        relevantStops.forEach((stopId) => {
            const stopIdStr = String(stopId);
            if (!Object.hasOwn(result, stopIdStr)) {
                result[stopIdStr] = [];
            }
            result[stopIdStr].push(alertMsg);
        });
    });

    return result;
}

async function getStaticInfo() {
    try {
        const raw = await fs.promises.readFile(path.join(constants.DATACACHE_ABS_PATH, "stm-info.json"));
        const info = JSON.parse(raw);
        return info;
    }
    catch (error) {
        console.error("Error getting static STM info", error);
    }
}

export async function getData(stopIds, numBuses, maxMinutes) {
    console.log("Getting STM data...");

    const [scheduleData, statusData, staticInfo] = await Promise.all([
        utils.handleCachedData("stm-gtfs.json", MILLISECONDS_UNTIL_STALE, async () => {
            return await fetchNewScheduleData();
        }),
        utils.handleCachedData("stm-status.json", MILLISECONDS_UNTIL_STALE, async () => {
            return await fetchNewStatusData();
        }),
        getStaticInfo()
    ]);

    console.log("Got all STM data. Processing...");

    const result = {
        alerts: processStatusData(statusData, stopIds),
        stopTimes: processGtfsData(scheduleData, stopIds, numBuses, maxMinutes, staticInfo)
    }

    return result;
}