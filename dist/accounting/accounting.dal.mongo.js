"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class AccountingDALMongo {
    constructor(db) {
        this.db = db;
        this.col_accounting_book = this.db.collection("accounting_book");
        this.col_accounting_transaction = this.db.collection("accounting_transaction");
    }
    async init() { }
    async ListBook(status) {
        const docs = await this.col_accounting_book.find({ status: status }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetBook(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_accounting_book.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateBook(ctx, book) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(book);
        await this.col_accounting_book.insertOne(doc, { session });
    }
    async UpdateBook(ctx, book) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(book);
        await this.col_accounting_book.updateOne({ _id: book.id }, { $set: doc }, { session });
    }
    async ListTransaction(query) {
        let filter = {};
        if (query.create_by) {
            filter.create_by = query.create_by;
        }
        if (query.ctime) {
            filter.ctime = { $gte: query.ctime[0], $lte: query.ctime[1] };
        }
        // const user_id = query.create_by;
        const docs = await this.col_accounting_transaction.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetTransaction(id) {
        const doc = await this.col_accounting_transaction.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreatTransaction(ctx, transaction) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = mongodb_1.ToMongoData.One(transaction);
        await this.col_accounting_transaction.insertOne(doc, { session });
    }
    async UpdateBookTotal(ctx, id, total) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_accounting_book.updateOne({ _id: id }, { $set: { total } }, { session });
    }
}
exports.AccountingDALMongo = AccountingDALMongo;
//# sourceMappingURL=accounting.dal.mongo.js.map