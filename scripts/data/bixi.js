import * as utils from "../utils.js";

const STATUS_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/station_status.json",
    INFO_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/station_information.json",
    ALERT_URL = "https://gbfs.velobixi.com/gbfs/2-2/en/system_alerts.json";

const CACHE_PATH = "./scripts/data/cached/bixi.json";

const MILLISECONDS_UNTIL_STALE = 60 * 1000; // 1 minute

async function fetchNewData(stationIds) {
    console.log("Fetching new bixi data");

    try {
        let result = {};

        const [statusResponse, infoResponse, alertResponse] = await Promise.all([
            fetch(STATUS_URL),
            fetch(INFO_URL),
            fetch(ALERT_URL)
        ]);

        if (!statusResponse.ok || !infoResponse.ok || !alertResponse.ok) {
            throw new Error(`HTTP error: ${statusResponse.status}, ${infoResponse.status}, ${alertResponse.status}`);
        }

        const [statusJson, infoJson, alertJson] = await Promise.all([
            statusResponse.json(),
            infoResponse.json(),
            alertResponse.json()
        ]);

        // get alerts
        const alertLastUpdated = alertJson.last_updated;
        const activeAlerts = alertJson.data.alerts.filter((a) => {
            for (const time of a.times) {
                if (time.start < alertLastUpdated && (time.end > alertLastUpdated || !time.end)) return true;
            }
            return false;
        });
        result["alerts"] = activeAlerts;

        // stations
        result["stations"] = {};

        for (const stationId of stationIds) {
            const stationInfo = infoJson.data.stations.find((s) => stationId == s.station_id);
            const stationStatus = statusJson.data.stations.find((s) => stationId == s.station_id);
            if (!stationInfo || !stationStatus) {
                console.error("Can't find station " + stationId);
                continue;
            }
            result["stations"][stationId] = formatStationData(stationStatus, stationInfo);
        }

        return result;

    }
    catch (error) {
        console.error("Error fetching bixi data", error);
    }

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
    const newDataFunction = async () => {
        return await fetchNewData(stationIds);
    }
    return await utils.handleCachedData(CACHE_PATH, MILLISECONDS_UNTIL_STALE, newDataFunction);
}
