"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
const order_1 = require("./order");
class OrderDALMongo {
    constructor(db) {
        this.db = db;
        this.col_order = this.db.collection("order");
        this.col_item = this.db.collection("order_item");
    }
    async init() {
        this.col_order.createIndex('code', { unique: true });
        this.col_item.createIndex('order_id');
    }
    async ListOrder(query) {
        const filter = {};
        if (query.status) {
            filter.status = query.status;
        }
        const docs = await this.col_order.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async ListItem(ctx, order_id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const docs = await this.col_item.find({ order_id: order_id }, { session }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetOrder(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_order.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetOrderByCode(ctx, code) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_order.findOne({ code }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetItem(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_item.findOne({ _id: id }, { session });
        if (!doc) {
            throw order_1.OrderNS.Errors.ErrItemNotFound;
        }
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateOrder(ctx, order) {
        const doc = mongodb_1.ToMongoData.One(order);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_order.insertOne(doc, { session });
    }
    async AddItem(ctx, item) {
        const doc = mongodb_1.ToMongoData.One(item);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_item.insertOne(doc, { session });
    }
    async UpdateItem(ctx, item) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(item);
        await this.col_item.updateOne({ _id: item.id }, { $set: doc }, { session });
    }
    async DeleteItem(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_item.deleteOne({ _id: id }, { session });
    }
    async UpdateOrder(ctx, order) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(order);
        await this.col_order.updateOne({ _id: order.id }, { $set: doc }, { session });
    }
}
exports.OrderDALMongo = OrderDALMongo;
//# sourceMappingURL=order.dal.mongo.js.map