"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class RetailDALMongo {
    constructor(db) {
        this.db = db;
        this.col_retail_order = this.db.collection("retail _order");
        this.col_retail_item = this.db.collection("retail_order_item");
    }
    async init() {
        //   this.col_retail.createIndex('code', { unique: true });
        //   this.col_item.createIndex('order_id');
    }
    async ListItem(ctx, order_id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const docs = await this.col_retail_item.find({ order_id: order_id }, { session }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetOrder(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_retail_order.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetOrderByCode(ctx, code) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_retail_order.findOne({ code }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateOrder(ctx, order) {
        const doc = mongodb_1.ToMongoData.One(order);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_retail_order.insertOne(doc, { session });
    }
    async AddItem(ctx, item) {
        const doc = mongodb_1.ToMongoData.One(item);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_retail_item.insertOne(doc, { session });
    }
    async UpdateOrder(ctx, order) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(order);
        await this.col_retail_order.updateOne({ _id: order.id }, { $set: doc }, { session });
    }
}
exports.RetailDALMongo = RetailDALMongo;
