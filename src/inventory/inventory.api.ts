import * as express from 'express';
import { HttpError, HttpStatusCodes, HttpParamValidators } from '../lib/http';
import { InventoryNS } from './inventory';
import { UserAuthNS } from '../auth/auth';
import { ContextNS } from '../ext/ctx';
import { NewAuthMiddleware, GetAuthData } from '../auth/auth.api.middleware';
// import * as Fuse from 'fuse.js';
const Fuse = require('fuse.js');

export function NewInventoryAPI(
    userAuthBLL: UserAuthNS.BLL,
    inventoryBLL: InventoryNS.BLL
) {
    const app = express();

    //ADD WAREHOUSE
    app.post("/warehouse/create", async (req, res) => {
        const name = HttpParamValidators.MustBeString(req.body, 'name', 2);
        const params: InventoryNS.CreateWareHouseParams = {
            name,
        };
        const warehouse = await inventoryBLL.CreateWareHouse(params);
        res.json(warehouse);
    });
    //UPDATE WAREHOUSE
    app.post("/warehouse/update", async (req, res) => {
        const id = HttpParamValidators.MustBeString(req.body, 'id');
        const name = req.body.name;
        const params: InventoryNS.UpdateWareHouseParams = {
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
        const doc = await inventoryBLL.GetWareHouse(req.query.id as string);
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
        const doc = await inventoryBLL.GetTransaction(req.query.id as string);
        res.json(doc);
    });

    //-----------------------------
    app.post("/lot/create", async (req, res) => {
        const code = HttpParamValidators.MustBeString(req.body, 'code');
        const warehouse_id = HttpParamValidators.MustBeString(req.body, 'warehouse_id');
        const product_id = HttpParamValidators.MustBeString(req.body, 'product_id');

        const total = req.body.total;
        const man_date = HttpParamValidators.MustBeString(req.body, 'man_date');
        const exp_date = HttpParamValidators.MustBeString(req.body, 'exp_date');
        const params: InventoryNS.CreateLotParams = {
            code,
            warehouse_id,
            product_id,
            total,
            man_date,
            exp_date
        };
        const ctx = ContextNS.New();
        const lot = await inventoryBLL.CreateLot(ctx, params);
        res.json(lot);
    });
    app.post("/lot/quantity", async (req, res) => {
        const lot_id = HttpParamValidators.MustBeString(req.body, 'id');
        const amount = req.body.amount; 
        const type = HttpParamValidators.MustBeOneOf(req.body, "type", Object.values(InventoryNS.TransactionType));
        const ctx = ContextNS.New();
        const params: InventoryNS.CreateTransactionParams = {
            amount,
            lot_id,
            ref: "lot",
            ref_id: lot_id,
            type: type,
        }
        await inventoryBLL.CreateManyTransaction(ctx, [params]);
        const lot = await inventoryBLL.GetLot(ctx, lot_id);
        res.json(lot);
    });
    app.post("/lot/update", async (req, res) => {
        const id = HttpParamValidators.MustBeString(req.body, 'id');
        const ctx = ContextNS.New();
        await inventoryBLL.UpdateLot(ctx, id, req.body);
        res.json(1);
    });
    //LIST LOT
    app.get("/lot/list", async (req, res) => {
        const warehouse_id = req.query.warehouse_id as string;
        const product_id = req.query.product_id as string;
        const docs = await inventoryBLL.ListLot(warehouse_id, product_id);
        res.json(docs);
    });
    //GET LOT
    app.get("/lot/get", async (req, res) => {
        const ctx = ContextNS.New();
        const doc = await inventoryBLL.GetLot(ctx, req.query.id as string);
        res.json(doc);
    });
    app.get("/lot/all", async (req, res) => {
        const docs = await inventoryBLL.GetAllLot();
        res.json(docs);
    })
     //GET SEARCH PRODUCT
    app.get("/search", async (req, res) => {
        const by = req.query.by as string;
        if(by === 'product'){
            const text = req.query.text as string;
            const docs = await inventoryBLL.SearchProduct();
            const options = {
                includeScore: true,
                keys: ['name','parts.name']
            }
            const fuse = new Fuse(docs, options)
            const result = fuse.search(text)
            if(result.length > 10){
                result.length = 10;
            }
            res.json(result);
        }
    });
    // ADD TRANSACTION
    app.post("/transaction/for_lot", async (req, res) => {
        const ctx = ContextNS.New();
        const lot_id = HttpParamValidators.MustBeString(req.body,'lot_id');
        const ref = "lot"
        const ref_id = lot_id;
        const amount = req.body.amount;
        if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
            throw new HttpError("transaction amount must be a negative integer", HttpStatusCodes.BadRequest);
        }
        const params: InventoryNS.CreateTransactionParams = {
            type: InventoryNS.TransactionType.LotRemain,
            ref,
            ref_id,
            lot_id,
            amount
        }
        const doc = await inventoryBLL.CreateOneTransaction(ctx, params);
        res.json(doc);
        
    })
    app.post("/transaction/for_retail", async (req, res) => {
        const ctx = ContextNS.New();
        const order_id = HttpParamValidators.MustBeString(req.body, "order_id", 6);
        const items = req.body.items;
        if (!Array.isArray(items)) {
            throw new HttpError("items must be array of transaction params", HttpStatusCodes.BadRequest);
        }
        if (items.length < 1) {
            res.json([]);
            return;
        }
        const params: InventoryNS.CreateTransactionParams[] = [];
        for (const tr of items) {
            const ref = "retail";
            const ref_id = order_id;
            const lot_id = HttpParamValidators.MustBeString(tr, 'lot_id');
            const amount = +tr.amount;
            if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
                throw new HttpError("transaction amount must be a negative integer", HttpStatusCodes.BadRequest);
            }
            const p: InventoryNS.CreateTransactionParams = {
                type: InventoryNS.TransactionType.LotRemain,
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
    app.use(NewAuthMiddleware(userAuthBLL));
    app.post("/transaction/for_order", async (req, res) => {
        const ctx = ContextNS.New();
        const order_id = HttpParamValidators.MustBeString(req.body, "order_id", 6);
        const items = req.body.items;
        if (!Array.isArray(items)) {
            throw new HttpError("items must be array of transaction params", HttpStatusCodes.BadRequest);
        }
        if (items.length < 1) {
            res.json([]);
            return;
        }
        const params: InventoryNS.CreateTransactionParams[] = [];
        for (const tr of items) {
            const ref = "order";
            const ref_id = order_id;
            const lot_id = HttpParamValidators.MustBeString(tr, 'lot_id');
            const amount = +tr.amount;
            const session = GetAuthData(req);
            const created_by = session.user_id;
            if (isNaN(amount) || amount > 0 || amount !== Math.round(amount)) {
                throw new HttpError("transaction amount must be a negative integer", HttpStatusCodes.BadRequest);
            }
            const p: InventoryNS.CreateTransactionParams = {
                type: InventoryNS.TransactionType.LotRemain,
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
