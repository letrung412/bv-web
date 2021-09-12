"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAPIRegion = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const region_1 = require("./region");
function NewAPIRegion(regionBLL) {
    const app = express();
    const type_regions = Object.values(region_1.RegionNS.Type);
    app.get("/region/list", async (req, res) => {
        const type = http_1.HttpParamValidators.MustBeOneOf(req.query, "type", type_regions);
        const parent_id = http_1.HttpParamValidators.MustBeString(req.query, "parent_id");
        const querry = {
            type,
            parent_id
        };
        const docs = await regionBLL.ListRegion(querry);
        docs.sort((a, b) => {
            if (a.name == "Tỉnh Bắc Ninh") {
                return -1;
            }
            else if (a.name == "Thành phố Hà Nội") {
                return -1;
            }
            return a.name.localeCompare(a.name);
        });
        res.json(docs);
    });
    app.get("/region/get", async (req, res) => {
        if (req.query.id) {
            const id = req.query.id;
            const doc = await regionBLL.GetRegion(id);
            res.json(doc);
        }
        if (req.query.name) {
            const name = req.query.name;
            const doc = await regionBLL.GetRegionByName(name);
            res.json(doc);
        }
    });
    app.post('/region/create', async (req, res) => {
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, "type", type_regions);
        const name = http_1.HttpParamValidators.MustBeString(req.body, "name");
        const parent_id = http_1.HttpParamValidators.MustBeString(req.body, "parent_id");
        const zip_code = http_1.HttpParamValidators.MustBeString(req.body, "zip_code");
        const params = {
            zip_code,
            name,
            type,
            parent_id
        };
        const doc = await regionBLL.CreateRegion(params);
        res.json(doc);
    });
    return app;
}
exports.NewAPIRegion = NewAPIRegion;
