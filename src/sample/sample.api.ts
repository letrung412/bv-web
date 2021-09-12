import * as express from "express";
import { ContextNS } from "../ext/ctx";
import { HttpParamValidators } from "../lib/http";
import { SampleNS } from "./sample";

export function NewSampleAI(
    sampleBLL : SampleNS.BLL
) {
    const app = express();

    app.get("/get", async (req,res) => {
        const id = req.query.id as string;
        const ctx = ContextNS.New();
        const doc = await sampleBLL.GetSample(ctx, id);
        res.json(doc);
    })

    app.get("/list", async (req,res) => {
        let docs = [];
        if (req.query.device) {
            const device = req.query.device as string;
            docs = await sampleBLL.ListSampleByDevice(device);
        } else {
            docs = await sampleBLL.ListSample();
        }
        res.json({
            count : docs.length,
            docs
        });
    })

    app.post("/create", async (req,res) => {
        const params : SampleNS.CreateSampleParams = {
            order_id : req.body.order_id as string
        }
        const docs = await sampleBLL.CreateSample(params);
        res.json(docs);
    })

    app.post("/send_result", async (req,res) => {
        const id = req.body.id as string;
        const result = req.body.result;
        const ctx = ContextNS.New();
        const doc = await sampleBLL.PostResult(ctx, id, result);
        res.json(doc);
    })
    return app;
}