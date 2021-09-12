"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewProductAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const product_1 = require("./product");
function NewProductAPI(userAuthBLL, productBLL) {
    const app = express();
    //ADD PRODUCER
    app.post("/producer/create", async (req, res) => {
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name', 2);
        const description = req.body.description;
        const params = {
            name,
            description,
        };
        const producer = await productBLL.CreateProducer(params);
        res.json(producer);
    });
    //GET LIST PRODUCER
    app.get("/producer/list", async (req, res) => {
        const docs = await productBLL.ListProducer();
        res.json(docs);
    });
    //UPDATE PRODUCER
    app.post("/producer/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const description = req.body.description;
        const name = req.body.name;
        const params = {
            name,
            description,
        };
        await productBLL.UpdateProducer(id, params);
        res.json(1);
    });
    //GET ONE PRODUCER
    app.get("/producer/get", async (req, res) => {
        const doc = await productBLL.GetProducer(req.query.id);
        res.json(doc);
    });
    //DELETE PRODUCER
    app.post("/producer/delete", async (req, res) => {
        const doc = await productBLL.DeleteProducer(req.body.id);
        res.json(doc);
    });
    //ADD PART
    app.post("/part/create", async (req, res) => {
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name', 2);
        const description = req.body.description;
        const params = {
            name,
            description,
        };
        const part = await productBLL.CreatePart(params);
        res.json(part);
    });
    //GET LIST PART
    app.get("/part/list", async (req, res) => {
        const docs = await productBLL.ListPart();
        res.json(docs);
    });
    //UPDATE PART
    app.post("/part/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const description = req.body.description;
        const name = req.body.name;
        const params = {
            name,
            description,
        };
        await productBLL.UpdatePart(id, params);
        res.json(1);
    });
    //GET ONE PART
    app.get("/part/get", async (req, res) => {
        const doc = await productBLL.GetPart(req.query.id);
        res.json(doc);
    });
    //DELETE PART
    app.post("/part/delete", async (req, res) => {
        const doc = await productBLL.DeletePart(req.body.id);
        res.json(doc);
    });
    //ADD PRODUCT
    app.post("/create", async (req, res) => {
        const producer_id = http_1.HttpParamValidators.MustBeString(req.body, 'producer_id', 2);
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name', 2);
        const price = req.body.price;
        const origin_price = req.body.origin_price;
        const parts = req.body.parts;
        const attrs = req.body.attrs;
        const unit = req.body.unit;
        const params = {
            name,
            price,
            producer_id,
            parts,
            attrs,
            unit,
            origin_price
        };
        const part = await productBLL.CreateProduct(params);
        res.json(part);
    });
    //GET LIST PRODUCT
    app.get("/list", async (req, res) => {
        const docs = await productBLL.ListProduct();
        res.json(docs);
    });
    //UPDATE PRODUCT
    app.post("/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const producer_id = http_1.HttpParamValidators.MustBeString(req.body, 'producer_id', 2);
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name', 2);
        const price = req.body.price;
        const unit = req.body.unit;
        const origin_price = req.body.origin_price;
        const parts = req.body.parts;
        const attrs = req.body.attrs;
        const params = {
            name,
            price,
            producer_id,
            unit,
            parts,
            attrs,
            origin_price
        };
        await productBLL.UpdateProduct(id, params);
        res.json(1);
    });
    //GET ONE PRODUCT
    app.get("/get", async (req, res) => {
        const doc = await productBLL.GetProduct(req.query.id);
        res.json(doc);
    });
    //DELETE PRODUCT
    app.post("/delete", async (req, res) => {
        const doc = await productBLL.DeleteProduct(req.body.id);
        res.json(doc);
    });
    //ERR
    const commonErrors = new Set([
        ...Object.values(product_1.ProductNS.Errors),
    ]);
    app.use((err, req, res, next) => {
        if (commonErrors.has(err)) {
            err = new http_1.HttpError(err.message, 400 /* BadRequest */);
        }
        next(err);
    });
    return app;
}
exports.NewProductAPI = NewProductAPI;
//# sourceMappingURL=product.api.js.map