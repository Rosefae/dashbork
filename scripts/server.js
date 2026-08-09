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
    const data = await getWeatherData(req.query);
    res.send(data);
});

app.get('/data/bixi', async (req, res) => {
    const stationIds = req.query.stationIds;
    const data = await getBixiData(stationIds);
    
    res.send(data);
});

app.listen(PORT, () => {
    console.log(`Express is listening on port ${PORT}`);
});