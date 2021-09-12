"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class ServiceDALMongo {
    constructor(db) {
        this.db = db;
        this.col_service = this.db.collection("service");
        this.col_service_policy = this.db.collection("service_policy");
        this.col_service_step = this.db.collection("service_step");
    }
    async init() {
        this.col_service_step.createIndex('service_id');
    }
    //-----------------------
    async ListService() {
        const docs = await this.col_service.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetService(id) {
        const doc = await this.col_service.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateService(service) {
        const doc = mongodb_1.ToMongoData.One(service);
        await this.col_service.insertOne(doc);
    }
    async UpdateService(service) {
        const doc = mongodb_1.ToMongoData.One(service);
        await this.col_service.updateOne({ _id: service.id }, { $set: doc });
    }
    async DeleteService(id) {
        await this.col_service.deleteOne({ _id: id });
    }
    //-----------------------
    async ListPolicy() {
        const docs = await this.col_service_policy.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetPolicy(id) {
        const doc = await this.col_service_policy.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreatePolicy(policy) {
        const doc = mongodb_1.ToMongoData.One(policy);
        await this.col_service_policy.insertOne(doc);
    }
    async UpdatePolicy(policy) {
        const doc = mongodb_1.ToMongoData.One(policy);
        await this.col_service_policy.updateOne({ _id: policy.id }, { $set: doc });
    }
    async DeletePolicy(id) {
        await this.col_service_policy.deleteOne({ _id: id });
    }
    //-------------------
    async GetStep(id) {
        const doc = await this.col_service_step.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateStep(step) {
        const doc = mongodb_1.ToMongoData.One(step);
        await this.col_service_step.insertOne(doc);
    }
    async ListStep(filter) {
        const docs = await this.col_service_step.find(filter).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async UpdateStep(step) {
        const doc = mongodb_1.ToMongoData.One(step);
        await this.col_service_step.updateOne({ _id: step.id }, { $set: doc });
    }
    async DeleteStep(id) {
        await this.col_service_step.deleteOne({ _id: id });
    }
}
exports.ServiceDALMongo = ServiceDALMongo;
