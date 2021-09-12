"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewSampleAI = void 0;
const express = require("express");
const ctx_1 = require("../ext/ctx");
function NewSampleAI(sampleBLL) {
    const app = express();
    app.get("/get", async (req, res) => {
        const id = req.query.id;
        const ctx = ctx_1.ContextNS.New();
        const doc = await sampleBLL.GetSample(ctx, id);
        res.json(doc);
    });
    app.get("/list", async (req, res) => {
        let docs = [];
        if (req.query.device) {
            const device = req.query.device;
            docs = await sampleBLL.ListSampleByDevice(device);
        }
        else {
            docs = await sampleBLL.ListSample();
        }
        res.json({
            count: docs.length,
            docs
        });
    });
    app.post("/create", async (req, res) => {
        const params = {
            order_id: req.body.order_id
        };
        const docs = await sampleBLL.CreateSample(params);
        res.json(docs);
    });
    app.post("/send_result", async (req, res) => {
        const id = req.body.id;
        const result = req.body.result;
        const ctx = ctx_1.ContextNS.New();
        const doc = await sampleBLL.PostResult(ctx, id, result);
        res.json(doc);
    });
    return app;
}
exports.NewSampleAI = NewSampleAI;
