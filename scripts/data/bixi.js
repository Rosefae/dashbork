import * as constants from "../constants.js";
import * as utils from "../utils.js";

const STATUS_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/station_status.json",
    INFO_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/station_information.json",
    ALERTS_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/system_alerts.json";

export const DATA_TIME_INTERVAL = 60 * 1000; // 1 minute
export const CACHE_FILE_NAME = "bixi.json";

export async function fetchNewData() {
    console.log("Fetching new bixi data");

    try {
        const [statusJson, infoJson, alertsJson] = await Promise.all([
            fetchSingleNewData(STATUS_URL),
            fetchSingleNewData(INFO_URL),
            fetchSingleNewData(ALERTS_URL)
        ]);

        return {
            status: statusJson,
            info: infoJson,
            alerts: alertsJson
        }
    }
    catch (error) {
        console.error("Error fetching new bixi data", error);
    }
}

async function fetchSingleNewData(dataUrl) {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const resultJson = await response.json();

        return resultJson;
    }
    catch (error) {
        console.error("Error fetching data", error);
    }
}

function processData(stationIds, data) {
    let processed = {};
    // get alerts
    const alertLastUpdated = data.alerts.last_updated;
    const activeAlerts = data.alerts.data.alerts.filter((a) => {
        for (const time of a.times) {
            if (time.start < alertLastUpdated && (time.end > alertLastUpdated || !time.end)) return true;
        }
        return false;
    });
    processed["alerts"] = activeAlerts;

    // stations
    processed["stations"] = {};

    for (const stationId of stationIds) {
        const stationInfo = data.info.data.stations.find((s) => stationId == s.station_id);
        const stationStatus = data.status.data.stations.find((s) => stationId == s.station_id);
        if (!stationInfo || !stationStatus) {
            console.error("Can't find station " + stationId);
            continue;
        }
        processed["stations"][stationId] = formatStationData(stationStatus, stationInfo);
    }

    return processed;
}

function formatStationData(status, info) {
    let result = {
        name: info.name,
        capacity: info.capacity,
        bikesAvail: status.num_bikes_available - status.num_ebikes_available, // num_bikes_available includes both bikes and ebikes
        ebikesAvail: status.num_ebikes_available,
        bikesDisabled: status.num_bikes_disabled,
        docksAvail: status.num_docks_available,
        docksDisabled: status.num_docks_disabled
    }

    return result;
}

export async function getData(stationIds) {
    if (stationIds.length <= 0) throw new Error("Must request at least one bixi station");

    console.log("Getting Bixi data...");

    const data = await utils.readCachedData(CACHE_FILE_NAME);

    return processData(stationIds, data);
}
