"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewServiceAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const service_1 = require("./service");
function NewServiceAPI(userAuthBLL, serviceBLL) {
    const app = express();
    const service_types = Object.values(service_1.ServiceNS.Type);
    app.post("/service/create", async (req, res) => {
        const code = http_1.HttpParamValidators.MustBeString(req.body, 'code');
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name');
        const price = req.body.price;
        const origin_price = req.body.origin_price;
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, 'type', service_types);
        const params = {
            code,
            name,
            price,
            origin_price,
            type
        };
        const service = await serviceBLL.CreateService(params);
        res.json(service);
    });
    app.get("/service/list", async (req, res) => {
        const docs = await serviceBLL.ListService();
        res.json(docs);
    });
    app.get("/service/get", async (req, res) => {
        const id = req.query.id;
        const doc = await serviceBLL.ViewService(id);
        res.json(doc);
    });
    app.post("/service/update", async (req, res) => {
        const id = req.body.id;
        const params = {};
        if (req.body.price) {
            params.price = req.body.price;
        }
        if (req.body.origin_price) {
            params.origin_price = req.body.origin_price;
        }
        const doc = await serviceBLL.UpdateService(id, params);
        res.json(doc);
    });
    app.post("/service/discount", async (req, res) => {
        const discount = req.body.discount * 0.01;
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, 'type', service_types);
        const docs = await serviceBLL.UpdatePriceDiscount(type, discount);
        res.json(docs);
    });
    app.post("/service/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeleteService(id);
        res.json(doc);
    });
    app.post("/policy/create", async (req, res) => {
        const code = http_1.HttpParamValidators.MustBeString(req.body, 'code');
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name');
        const discount = req.body.discount;
        const params = {
            code,
            name,
            discount
        };
        const policy = await serviceBLL.CreatePolicy(params);
        res.json(policy);
    });
    app.get("/policy/list", async (req, res) => {
        const docs = await serviceBLL.ListPolicy();
        res.json(docs);
    });
    app.get("/policy/get", async (req, res) => {
        const id = req.query.id;
        const doc = await serviceBLL.GetPolicy(id);
        res.json(doc);
    });
    app.post("/policy/update", async (req, res) => {
        const id = req.body.id;
        const code = http_1.HttpParamValidators.MustBeString(req.body, 'code');
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name');
        const discount = req.body.discount;
        const params = {
            code,
            name,
            discount
        };
        await serviceBLL.UpdatePolicy(id, params);
        res.json(1);
    });
    app.post("/policy/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeletePolicy(id);
        res.json(doc);
    });
    app.get("/step/list", async (req, res) => {
        let filter = {};
        if (req.query.service_id) {
            filter.service_id = req.query.service_id;
        }
        const docs = await serviceBLL.ListStep(filter);
        res.json(docs);
    });
    app.post("/step/create", async (req, res) => {
        const service_id = http_1.HttpParamValidators.MustBeString(req.body, 'service_id');
        const steps = req.body.steps;
        const params = {
            service_id,
            steps
        };
        const docs = await serviceBLL.AddStep(params);
        res.json(docs.length);
    });
    app.post("/step/update", async (req, res) => {
        const id = req.body.id;
        const service_id = http_1.HttpParamValidators.MustBeString(req.body, 'service_id');
        const params = {
            service_id,
            ...req.body
        };
        await serviceBLL.UpdateStep(id, params);
        res.json(1);
    });
    app.post("/step/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeleteStep(id);
        res.json(1);
    });
    return app;
}
exports.NewServiceAPI = NewServiceAPI;
