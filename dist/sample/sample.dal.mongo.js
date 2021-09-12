"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
const sample_1 = require("./sample");
class SampleDALMongo {
    constructor(db) {
        this.db = db;
        this.col_sample = this.db.collection("sample");
    }
    async init() {
        // this.col_sample.createIndex({_id : 1}, {name : "_id", unique : true, background : true});
    }
    async GetSample(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_sample.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async ListSample(filter) {
        const docs = await this.col_sample.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async CreateSample(sample) {
        try {
            const doc = mongodb_1.ToMongoData.One(sample);
            await this.col_sample.insertOne(doc);
        }
        catch (err) {
            if (err.code == 11000 /* Duplicate */) {
                throw sample_1.SampleNS.Errors.ErrSampleIdExisted;
            }
            else {
                throw err;
            }
        }
    }
    async PostResult(ctx, sample) {
        try {
            const session = mongodb_1.MongoCommon.Session(ctx);
            const doc = mongodb_1.ToMongoData.One(sample);
            await this.col_sample.updateOne({ _id: doc._id }, { $set: doc }, { session });
        }
        catch (err) {
            throw err;
        }
    }
}
exports.SampleDALMongo = SampleDALMongo;
//# sourceMappingURL=sample.dal.mongo.js.map