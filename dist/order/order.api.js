"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewOrderAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const order_1 = require("./order");
const ctx_1 = require("../ext/ctx");
function NewOrderAPI(userAuthBLL, orderBLL, jobBLL, orgBLL) {
    const app = express();
    const order_statuses = Object.values(order_1.OrderNS.Status);
    app.get("/order/list", async (req, res) => {
        const status = req.query.status;
        if (status) {
            http_1.HttpParamValidators.MustBeOneOf(req.query, "status", order_statuses);
        }
        const query = {
            status
        };
        const docs = await orderBLL.ListOrder(query);
        res.json(docs);
    });
    app.get("/order/get", async (req, res) => {
        let id = req.query.id;
        const code = req.query.code;
        if (!id && !code) {
            throw new http_1.HttpError(`id or code is required`, 400);
        }
        const ctx = ctx_1.ContextNS.New();
        if (!id) {
            const order = await orderBLL.GetOrderByCode(ctx, code);
            id = order.id;
        }
        const order = await orderBLL.GetOrder(ctx, id);
        const job_steps = await jobBLL.GetStep(ctx, order.ref_id);
        const job = await jobBLL.GetJob(ctx, job_steps.job_id);
        const user = await orgBLL.GetUser(job_steps.created_by);
        const view_order = await orderBLL.ViewOrder(ctx, id);
        res.json({ job, user, view_order });
    });
    app.post("/item/add", async (req, res) => {
        const { order_id, ref_id, quantity } = req.body;
        const ref = http_1.HttpParamValidators.MustBeOneOf(req.body, "ref", ["service", "product"]);
        const params = {
            ref,
            ref_id,
            quantity
        };
        const ctx = ctx_1.ContextNS.New();
        const item = await orderBLL.AddItem(ctx, order_id, params);
        res.json(item);
    });
    app.post("/item/update", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const doc = await orderBLL.UpdateItem(ctx, req.body);
        res.json(doc);
    });
    app.get("/item/get", async (req, res) => {
        const id = req.query.id;
        const ctx = ctx_1.ContextNS.New();
        const doc = await orderBLL.GetItem(ctx, id);
        res.json(doc);
    });
    return app;
}
exports.NewOrderAPI = NewOrderAPI;
