"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewOrderRetailAPI = void 0;
const express = require("express");
const ctx_1 = require("../ext/ctx");
function NewOrderRetailAPI(retailBLL) {
    const app = express();
    app.post("/create", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const items = req.body.items;
        const params = {
            items: items
        };
        const docs = await retailBLL.CreateOrder(ctx, params);
        res.json(docs);
    });
    app.get("/get", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        if (req.query.id) {
            const id = req.query.id;
            const order = await retailBLL.GetOrder(ctx, id);
            return res.json(order);
        }
        if (req.query.code) {
            const code = req.query.code;
            const order = await retailBLL.GetOrderByCode(ctx, code);
            return res.json(order);
        }
    });
    return app;
}
exports.NewOrderRetailAPI = NewOrderRetailAPI;
