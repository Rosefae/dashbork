import * as constants from "../constants.js";
import * as utils from "../utils.js";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export const DATA_TIME_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const PLACES_TO_CARE_ABOUT = [
    {
        latitude: 45.46,
        longitude: -73.57
    }
]

const WEATHER_CODE_MAP = {
    "0": {
        "description": "Sunny",
        "icon": "sunny",
        "night": {
            "description": "Clear",
            "icon": "bedtime"
        }
    },
    "1": {
        "description": "Mainly Sunny",
        "icon": "sunny",
        "night": {
            "description": "Mainly Clear",
            "icon": "bedtime"
        }
    },
    "2": {
        "description": "Partly Cloudy",
        "icon": "partly_cloudy_day",
        "night": {
            "description": "Partly Cloudy",
            "icon": "partly_cloudy_night"
        }
    },
    "3": {
        "description": "Cloudy",
        "icon": "cloud"
    },
    "45": {
        "description": "Foggy",
        "icon": "foggy"
    },
    "48": {
        "description": "Rime Fog",
        "icon": "foggy"
    },
    "51": {
        "description": "Light Drizzle",
        "icon": "rainy"
    },
    "53": {
        "description": "Drizzle",
        "icon": "rainy"
    },
    "55": {
        "description": "Heavy Drizzle",
        "icon": "rainy"
    },
    "56": {
        "description": "Light Freezing Drizzle",
        "icon": "weather_mix"
    },
    "57": {
        "description": "Freezing Drizzle",
        "icon": "weather_mix"
    },
    "61": {
        "description": "Light Rain",
        "icon": "rainy"
    },
    "63": {
        "description": "Rain",
        "icon": "rainy"
    },
    "65": {
        "description": "Heavy Rain",
        "icon": "rainy"
    },
    "66": {
        "description": "Light Freezing Rain",
        "icon": "weather_mix"
    },
    "67": {
        "description": "Freezing Rain",
        "icon": "weather_mix"
    },
    "71": {
        "description": "Light Snow",
        "icon": "weather_snowy"
    },
    "73": {
        "description": "Snow",
        "icon": "weather_snowy"
    },
    "75": {
        "description": "Heavy Snow",
        "icon": "weather_snowy"
    },
    "77": {
        "description": "Snow Grains",
        "icon": "weather_snowy"
    },
    "80": {
        "description": "Light Showers",
        "icon": "rainy"
    },
    "81": {
        "description": "Showers",
        "icon": "rainy"
    },
    "82": {
        "description": "Heavy Showers",
        "icon": "rainy"
    },
    "85": {
        "description": "Light Snow Showers",
        "icon": "weather_mix"
    },
    "86": {
        "description": "Snow Showers",
        "icon": "weather_mix"
    },
    "95": {
        "description": "Thunderstorm",
        "icon": "thunderstorm"
    },
    "96": {
        "description": "Light Thunderstorms With Hail",
        "icon": "thunderstorm"
    },
    "99": {
        "description": "Thunderstorm With Hail",
        "icon": "thunderstorm"
    }
}

export function getCacheString(latitude, longitude) {
    return `weather/lat${latitude}long${longitude}.json`;
}

export async function fetchNewData(latitude, longitude) {
    const apiQueryString = formatAPIQueryString(latitude, longitude);
    return await fetchNewDataFromQueryString(apiQueryString);
}

function formatAPIQueryString(latitude, longitude) {
    let queryString = `latitude=${latitude}&longitude=${longitude}`;

    // current weather
    queryString += "&current=temperature_2m,apparent_temperature,is_day,weather_code,surface_pressure";

    // daily forcast
    queryString += "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_probability_max";

    queryString += "&timezone=auto&forecast_days=1";
    // potential room to extend forecast days later

    return queryString;
}

async function fetchNewDataFromQueryString(queryString) {
    console.log(`Fetching new weather data with query string: ${queryString}`);
    const fetchUrl = API_URL + "?" + queryString;

    try {
        const response = await fetch(fetchUrl);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        console.log("Weather data recieved. Parsing...");
        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Error fetching weather data", error);
    }
}

function processData(data) {
    let processed = {};
    if (data.current) {
        processed["current"] = formatCurrentWeatherData(data.current, data.current_units);
    }

    if (data.daily) {
        processed["daily"] = formatDailyWeatherData(data.daily, data.daily_units);
    }

    return processed;
}

function formatCurrentWeatherData(data, units) {
    const currentData = {
        weatherType: getWeatherType(data.weather_code, data.is_day === 0),
        temperature: data.temperature_2m,
        feelsLike: data.apparent_temperature,
        pressure: data.surface_pressure,
        tempUnit: units.temperature_2m,
        pressureUnit: units.surface_pressure
    }

    return currentData;
}

function formatDailyWeatherData(data, units) {
    let result = [];
    for (let i = 0; i < data.time.length; i++) {
        const time = data.time[i];
        const weatherCode = data.weather_code[i];
        const dailyData = {
            weatherType: getWeatherType(weatherCode),
            tempMax: data.temperature_2m_max[i],
            tempMin: data.temperature_2m_min[i],
            feelsLikeMax: data.apparent_temperature_max[i],
            feelsLikeMin: data.apparent_temperature_min[i],
            uv: data.uv_index_max[i],
            pop: data.precipitation_probability_max[i],
            tempUnit: units.temperature_2m_max,
            date: data.time[i],
            label: getDayLabel(data.time[i])
        }

        result.push(dailyData);
    }

    return result;
}

function getDayLabel(dateString) {
    const weatherDate = Temporal.PlainDate.from(dateString),
        today = Temporal.Now.plainDateISO(),
        daysUntil = today.until(weatherDate).days;
    
    if (daysUntil == 0) {
        return "Today";
    }

    if (daysUntil == 1) {
        return "Tomorrow";
    }

    return weatherDate.dayOfWeek;
}

function getWeatherType(weatherCode, isNight = false) {
    let weatherType = WEATHER_CODE_MAP[weatherCode];
    if (isNight && weatherType.night !== undefined) {
        weatherType = weatherType.night;
    }

    return weatherType;
}

export async function getData(params) {
    if (!params.latitude || !params.longitude) throw new Error("Missing weather latitude/longitude!");

    console.log("Getting weather data...");

    const dataCachePath = `weather/lat${params.latitude}long${params.longitude}.json`;
    const data = await utils.handleCachedData(dataCachePath, DATA_TIME_INTERVAL, async () => {
        return fetchNewData(params.latitude, params.longitude);
    });

    return processData(data);
}