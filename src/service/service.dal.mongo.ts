import { ServiceNS } from "./service";
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";
import * as fs from "fs"
export class ServiceDALMongo implements ServiceNS.DAL {
    constructor(
        private db: MongoDB
    ) { }

    async init() {
        this.col_service_step.createIndex('service_id');
    }

    private col_service = this.db.collection("service");
    private col_service_policy = this.db.collection("service_policy");
    private col_service_step = this.db.collection("service_step");

    //-----------------------
    async ListService() {
        const docs = await this.col_service.find().toArray();
        return FromMongoData.Many<ServiceNS.Service>(docs);
    }

    async GetService(id: string) {
        const doc = await this.col_service.findOne({ _id: id });
        return FromMongoData.One<ServiceNS.Service>(doc);
    }

    async CreateService(service: ServiceNS.Service) {
        const doc = ToMongoData.One(service);
        await this.col_service.insertOne(doc);
    }

    async UpdateService(service: ServiceNS.Service) {
        const doc = ToMongoData.One(service);
        await this.col_service.updateOne({ _id: service.id }, { $set: doc });
    }

    async DeleteService(id: string) {
        await this.col_service.deleteOne({ _id: id });
    }

    //-----------------------
    async ListPolicy() {
        const docs = await this.col_service_policy.find().toArray();
        return FromMongoData.Many<ServiceNS.Policy>(docs);
    }

    async GetPolicy(id: string) {
        const doc = await this.col_service_policy.findOne({ _id: id });
        return FromMongoData.One<ServiceNS.Policy>(doc);
    }

    async CreatePolicy(policy: ServiceNS.Policy) {
        const doc = ToMongoData.One(policy);
        await this.col_service_policy.insertOne(doc);
    }

    async UpdatePolicy(policy: ServiceNS.Policy) {
        const doc = ToMongoData.One(policy);
        await this.col_service_policy.updateOne({ _id: policy.id }, { $set: doc });
    }

    async DeletePolicy(id: string) {
        await this.col_service_policy.deleteOne({ _id: id });
    }

    //-------------------

    async GetStep(id: string) {
        const doc = await this.col_service_step.findOne({ _id: id });
        return FromMongoData.One<ServiceNS.Step>(doc);
    }

    async CreateStep(step: ServiceNS.CreateStepParams) {
        const doc = ToMongoData.One(step);
        await this.col_service_step.insertOne(doc);
    }

    async ListStep(filter : object) {
        const docs = await this.col_service_step.find(filter).toArray();
        return FromMongoData.Many<ServiceNS.Step>(docs);
    }

    async UpdateStep(step: ServiceNS.Step) {
        const doc = ToMongoData.One(step);
        await this.col_service_step.updateOne({ _id: step.id }, { $set: doc });
    }

    async DeleteStep(id: string) {
        await this.col_service_step.deleteOne({ _id: id });
    }

}