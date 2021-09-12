"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class JobDALMongo {
    constructor(db) {
        this.db = db;
        this.col_job = this.db.collection("job");
        this.col_job_step = this.db.collection("job_step");
    }
    async init() {
        this.col_job_step.createIndex('location_id');
        this.col_job_step.createIndex('job_id');
        this.col_job_step.createIndex('code', { unique: true });
    }
    async CreateJob(ctx, job) {
        const doc = mongodb_1.ToMongoData.One(job);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_job.insertOne(doc, { session });
    }
    async GetJob(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_job.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateJob(ctx, job) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const { modifiedCount } = await this.col_job.updateOne({ _id: job.id }, {
            $set: {
                modified_by: job.modified_by,
                state: job.state,
                mtime: job.mtime,
            }
        }, { session });
        return modifiedCount;
    }
    async GetStep(ctx, id) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_job_step.findOne({ _id: id }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetStepByCode(ctx, code) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await this.col_job_step.findOne({ code }, { session });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateStep(ctx, step) {
        const doc = mongodb_1.ToMongoData.One(step);
        const session = mongodb_1.MongoCommon.Session(ctx);
        await this.col_job_step.insertOne(doc, { session });
    }
    async UpdateStep(ctx, job_step) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = await mongodb_1.ToMongoData.One(job_step);
        await this.col_job_step.updateOne({ _id: doc._id }, {
            $set: doc
        }, { session });
    }
    async ListStep(ctx, query) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const filter = {};
        if (query.location_id) {
            filter.location_id = query.location_id;
        }
        if (query.status) {
            filter.status = { $in: query.status };
        }
        if (query.job_id) {
            filter.job_id = query.job_id;
        }
        if (query.type) {
            filter.type = { $in: query.type };
        }
        const docs = await this.col_job_step.find(filter, { session }).toArray();
        const steps = mongodb_1.FromMongoData.Many(docs);
        return steps;
    }
    async ListJob(ctx, query) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const filter = {};
        if (Array.isArray(query.ref_id)) {
            filter.ref_id = { $in: query.ref_id };
        }
        if (query.date) {
            filter.date = query.date;
        }
        const docs = await this.col_job.find(filter, { session }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async CountJob(ctx, query) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const filter = {};
        if (Array.isArray(query.ref_id)) {
            filter.ref_id = { $in: query.ref_id };
        }
        if (query.date) {
            filter.date = query.date;
        }
        const count = await this.col_job.countDocuments(filter, { session });
        return count;
    }
}
exports.JobDALMongo = JobDALMongo;
//# sourceMappingURL=job.dal.mongo.js.map