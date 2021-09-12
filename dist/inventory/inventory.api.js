"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewInventoryAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const inventory_1 = require("./inventory");
const ctx_1 = require("../ext/ctx");
const auth_api_middleware_1 = require("../auth/auth.api.middleware");
// import * as Fuse from 'fuse.js';
const Fuse = require('fuse.js');
function NewInventoryAPI(userAuthBLL, inventoryBLL) {
    const app = express();
    //ADD WAREHOUSE
    app.post("/warehouse/create", async (req, res) => {
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name', 2);
        const params = {
            name,
        };
        const warehouse = await inventoryBLL.CreateWareHouse(params);
        res.json(warehouse);
    });
    //UPDATE WAREHOUSE
    app.post("/warehouse/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const name = req.body.name;
        const params = {
            name,
        };
        await inventoryBLL.UpdateWareHouse(id, params);
        res.json(1);
    });
    //LIST WAREHOUSE
    app.get("/warehouse/list", async (req, res) => {
        const docs = await inventoryBLL.ListWareHouse();
        res.json(docs);
    });
    //GET WAREHOUSE
    app.get("/warehouse/get", async (req, res) => {
        const doc = await inventoryBLL.GetWareHouse(req.query.id);
        res.json(doc);
    });
    //-----------------------------
    //LIST TRANSACTION
    app.get("/transaction/list", async (req, res) => {
        const docs = await inventoryBLL.ListTransaction({});
        res.json(docs);
    });
    //GET TRANSACTION
    app.get("/transaction/get", async (req, res) => {
        const doc = await inventoryBLL.GetTransaction(req.query.id);
        res.json(doc);
    });
    //-----------------------------
    app.post("/lot/create", async (req, res) => {
        const code = http_1.HttpParamValidators.MustBeString(req.body, 'code');
        const warehouse_id = http_1.HttpParamValidators.MustBeString(req.body, 'warehouse_id');
        const product_id = http_1.HttpParamValidators.MustBeString(req.body, 'product_id');
        const total = req.body.total;
        const man_date = http_1.HttpParamValidators.MustBeString(req.body, 'man_date');
        const exp_date = http_1.HttpParamValidators.MustBeString(req.body, 'exp_date');
        const params = {
            code,
            warehouse_id,
            product_id,
            total,
            man_date,
            exp_date
        };
        const ctx = ctx_1.ContextNS.New();
        const lot = await inventoryBLL.CreateLot(ctx, params);
        res.json(lot);
    });
    app.post("/lot/quantity", async (req, res) => {
        const lot_id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const amount = req.body.amount;
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, "type", Object.values(inventory_1.InventoryNS.TransactionType));
        const ctx = ctx_1.ContextNS.New();
        const params = {
            amount,
            lot_id,
            ref: "lot",
            ref_id: lot_id,
            type: type,
        };
        await inventoryBLL.CreateManyTransaction(ctx, [params]);
        const lot = await inventoryBLL.GetLot(ctx, lot_id);
        res.json(lot);
    });
    app.post("/lot/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const ctx = ctx_1.ContextNS.New();
        await inventoryBLL.UpdateLot(ctx, id, req.body);
        res.json(1);
    });
    //LIST LOT
    app.get("/lot/list", async (req, res) => {
        const warehouse_id = req.query.warehouse_id;
        const product_id = req.query.product_id;
        const docs = await inventoryBLL.ListLot(warehouse_id, product_id);
        res.json(docs);
    });
    //GET LOT
    app.get("/lot/get", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const doc = await inventoryBLL.GetLot(ctx, req.query.id);
        res.json(doc);
    });
    app.get("/lot/all", async (req, res) => {
        const docs = await inventoryBLL.GetAllLot();
        res.json(docs);
    });
    //GET SEARCH PRODUCT
    app.get("/search", async (req, res) => {
        const by = req.query.by;
        if (by === 'product') {
            const text = req.query.text;
            const docs = await inventoryBLL.SearchProduct();
            const options = {
                includeScore: true,
                keys: ['name', 'parts.name']
            };
            const fuse = new Fuse(docs, options);
            const result = fuse.search(text);
            if (result.length > 10) {
                result.length = 10;
            }
            res.json(result);
        }
    });
    // ADD TRANSACTION
    app.post("/transaction/for_lot", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const lot_id = http_1.HttpParamValidators.MustBeString(req.body, 'lot_id');
        const ref = "lot";
        const ref_id = lot_id;
        const amount = req.body.amount;
        if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
            throw new http_1.HttpError("transaction amount must be a negative integer", 400 /* BadRequest */);
        }
        const params = {
            type: inventory_1.InventoryNS.TransactionType.LotRemain,
            ref,
            ref_id,
            lot_id,
            amount
        };
        const doc = await inventoryBLL.CreateOneTransaction(ctx, params);
        res.json(doc);
    });
    app.post("/transaction/for_retail", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const order_id = http_1.HttpParamValidators.MustBeString(req.body, "order_id", 6);
        const items = req.body.items;
        if (!Array.isArray(items)) {
            throw new http_1.HttpError("items must be array of transaction params", 400 /* BadRequest */);
        }
        if (items.length < 1) {
            res.json([]);
            return;
        }
        const params = [];
        for (const tr of items) {
            const ref = "retail";
            const ref_id = order_id;
            const lot_id = http_1.HttpParamValidators.MustBeString(tr, 'lot_id');
            const amount = +tr.amount;
            if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
                throw new http_1.HttpError("transaction amount must be a negative integer", 400 /* BadRequest */);
            }
            const p = {
                type: inventory_1.InventoryNS.TransactionType.LotRemain,
                ref,
                ref_id,
                lot_id,
                amount
            };
            params.push(p);
        }
        const docs = await inventoryBLL.CreateManyTransaction(ctx, params);
        res.json(docs);
    });
    app.use(auth_api_middleware_1.NewAuthMiddleware(userAuthBLL));
    app.post("/transaction/for_order", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const order_id = http_1.HttpParamValidators.MustBeString(req.body, "order_id", 6);
        const items = req.body.items;
        if (!Array.isArray(items)) {
            throw new http_1.HttpError("items must be array of transaction params", 400 /* BadRequest */);
        }
        if (items.length < 1) {
            res.json([]);
            return;
        }
        const params = [];
        for (const tr of items) {
            const ref = "order";
            const ref_id = order_id;
            const lot_id = http_1.HttpParamValidators.MustBeString(tr, 'lot_id');
            const amount = +tr.amount;
            const session = auth_api_middleware_1.GetAuthData(req);
            const created_by = session.user_id;
            if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
                throw new http_1.HttpError("transaction amount must be a negative integer", 400 /* BadRequest */);
            }
            const p = {
                type: inventory_1.InventoryNS.TransactionType.LotRemain,
                ref,
                ref_id,
                lot_id,
                created_by,
                amount
            };
            params.push(p);
        }
        const docs = await inventoryBLL.CreateManyTransaction(ctx, params);
        res.json(docs);
    });
    return app;
}
exports.NewInventoryAPI = NewInventoryAPI;
//# sourceMappingURL=inventory.api.js.map