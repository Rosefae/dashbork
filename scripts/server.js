import * as http from "node:http";
import * as path from "node:path";
import * as fs from "fs";
import express from "express";

import * as constants from "./constants.js";
import * as utils from "./utils.js";



import { getData as getWeatherData } from "./data/weather.js";
import { getData as getBixiData } from "./data/bixi.js";
import { getData as getStmData } from "./data/stm.js";

import { beginFetchAll } from "./data/_fetchall.js";

const PORT = constants.PORT;
const PAGES_PATH = constants.PAGES_ABS_PATH;
const RENDERS_PATH = constants.RENDERS_ABS_PATH;

const app = express();

app.use(express.static(PAGES_PATH));
app.use(constants.RENDERS_REL_URL, express.static(RENDERS_PATH));

beginFetchAll();

app.get('/data/weather', async (req, res) => {
    try {
        const data = await getWeatherData(req.query);
        res.json(data);
    } catch (error) {
        res.status(400).json(error);
    }
});

app.get('/data/bixi', async (req, res) => {
    try {
        const stationIds = req.query.stationIds;
        const data = await getBixiData(stationIds);

        res.json(data);
    } catch (error) {
        res.status(400).json(error);
    }
});

app.get('/data/stm', async (req, res) => {
    try {
        const stopIds = req.query.stopIds;
        const numBuses = req.query.numBuses;
        const maxMinutes = req.query.maxMinutes;
        const timeFormat = req.query.timeFormat;
        const data = await getStmData(stopIds, numBuses, maxMinutes, timeFormat);

        res.json(data);
    } catch (error) {
        res.status(400).json(error);
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express is listening on port ${PORT}`);
});
