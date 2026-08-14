import * as http from "node:http";
import * as path from "node:path";
import express from "express";

import * as constants from "./constants.js";
import * as utils from "./utils.js";



import { getData as getWeatherData } from "./data/weather.js";
import { getData as getBixiData } from "./data/bixi.js";
import { getData as getStmData } from "./data/stm.js";

import { renderImage } from "./renderImage.js";
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

// api/setup and api/display must mimic trmnl servers
// https://docs.trmnl.com/go/diy/byod-s

app.get('/api/display', async (req, res) => {
    try {
        const dashboard = req.query.dashboard,
            width = parseInt(req.query.width),
            height = parseInt(req.query.height),
            isGrayscale = req.query.isGrayscale === "true",
            imgFormat = req.query.format || "png";

        const screenshot = await renderImage(dashboard, width, height, isGrayscale, imgFormat);
        
        res.json({ img_url: screenshot.publicUrl });
    } catch (error) {
        res.status(400).json(error);
    }

});

app.listen(PORT, () => {
    console.log(`Express is listening on port ${PORT}`);
});