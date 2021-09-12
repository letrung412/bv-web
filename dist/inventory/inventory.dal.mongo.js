"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryDALMongo = void 0;
const inventory_1 = require("./inventory");
const mongodb_1 = require("../lib/mongodb");
class InventoryDALMongo {
    constructor(db) {
        this.db = db;
        this.col_inventory_warehouse = this.db.collection("inventory_warehouse");
        this.col_inventory_lot = this.db.collection("inventory_lot");
        this.col_inventory_transaction = this.db.collection("inventory_transaction");
    }
    async init() {
        this.col_inventory_lot.createIndex({ code: 1, warehouse_id: 1 }, { unique: true });
    }
    //WAREHOUSE
    async ListWareHouse() {
        const docs = await this.col_inventory_warehouse.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetWareHouse(id) {
        const doc = await this.col_inventory_warehouse.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateWareHouse(warehouse) {
        const doc = mongodb_1.ToMongoData.One(warehouse);
        await this.col_inventory_warehouse.insertOne(doc);
    }
    async UpdateWareHouse(warehouse) {
        const doc = mongodb_1.ToMongoData.One(warehouse);
        await this.col_inventory_warehouse.updateOne({ _id: warehouse.id }, { $set: doc });
    }
    //TRANSACTION
    async ListTransaction(query) {
        const filter = {};
        if (query.warehouse_id) {
            filter.warehouse_id = query.warehouse_id;
        }
        if (query.lot_id) {
            filter.lot_id = query.lot_id;
        }
        if (query.product_id) {
            filter.product_id = query.product_id;
        }
        const docs = await this.col_inventory_transaction.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetTransaction(id) {
        const doc = await this.col_inventory_transaction.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateTransaction(ctx, tranaction) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(tranaction);
        await this.col_inventory_transaction.insertOne(doc, { session });
    }
    ///LOT
    async ListLot(warehouse_id, product_id) {
        const filter = {};
        if (warehouse_id) {
            filter.warehouse_id = warehouse_id;
        }
        if (product_id) {
            filter.product_id = product_id;
        }
        const docs = await this.col_inventory_lot.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetLot(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_inventory_lot.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateLot(ctx, lot) {
        try {
            const session = mongodb_1.MongoCommon.Session(ctx);
            const doc = mongodb_1.ToMongoData.One(lot);
            await this.col_inventory_lot.insertOne(doc, { session });
        }
        catch (err) {
            if (err.code === 11000 /* Duplicate */) {
                throw inventory_1.InventoryNS.Errors.ErrLotCodeExisted;
            }
            else {
                throw err;
            }
        }
    }
    async UpdateLot(ctx, lot) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(lot);
        await this.col_inventory_lot.updateOne({ _id: lot.id }, { $set: doc }, { session });
    }
    async GetAllLot() {
        const docs = await this.col_inventory_lot.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
}
exports.InventoryDALMongo = InventoryDALMongo;
//# sourceMappingURL=inventory.dal.mongo.js.map