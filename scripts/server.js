import * as http from "node:http";
import * as path from "node:path";
import express from "express";

import { getData as getWeatherData } from "./data/weather.js";
import { getData as getBixiData } from "./data/bixi.js";

const PORT = 8080;
const STATIC_PATH = path.join(process.cwd(), "./pages");

const app = express();

app.use(express.static(STATIC_PATH));

app.get('/data/weather', async (req, res) => {
    // Todo: get params from req
    const params = {
        latitude: 45.46,
        longitude: -73.57,
        current: true,
        today: true
    }
    const data = await getWeatherData(params);

    res.send(data);
});

app.get('/data/bixi', async (req, res) => {
    // Todo get station ids from req
    const stationIds = [303, 570, 428, 671];
    const data = await getBixiData(stationIds);
    
    res.send(data);
});

app.listen(PORT, () => {
    console.log(`Express is listening on port ${PORT}`);
});