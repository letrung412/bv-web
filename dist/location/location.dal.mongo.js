"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class LocationDALMongo {
    constructor(db) {
        this.db = db;
        this.col_location = this.db.collection("location");
        this.locationTypeCol = this.db.collection("location_type");
        /// LOCATION_SERVICE
        this.col_location_service = this.db.collection("location_service");
        this.col_service = this.db.collection("service");
    }
    async init() {
    }
    async ListLocation() {
        const docs = await this.col_location.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetLocation(id) {
        const doc = await this.col_location.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateLocation(location) {
        const doc = mongodb_1.ToMongoData.One(location);
        await this.col_location.updateOne({ _id: location.id }, { $set: doc });
    }
    async DeleteLocation(id) {
        await this.col_location.deleteOne({ _id: id });
    }
    async CreateLocation(location) {
        const doc = mongodb_1.ToMongoData.One(location);
        await this.col_location.insertOne(doc);
    }
    async ListLocationOfType(type) {
        const docs = await this.col_location.find({ location_type: type }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async ListType() {
        const docs = await this.locationTypeCol.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetType(id) {
        const doc = await this.locationTypeCol.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateType(locationType) {
        const doc = mongodb_1.ToMongoData.One(locationType);
        await this.locationTypeCol.updateOne({ _id: locationType.id }, { $set: doc });
    }
    async DeleteType(id) {
        await this.locationTypeCol.deleteOne({ _id: id });
    }
    async CreateType(locationType) {
        const doc = mongodb_1.ToMongoData.One(locationType);
        await this.locationTypeCol.insertOne(doc);
    }
    async ListService(location_id) {
        const data = await this.col_location_service.find({ location_id }).toArray();
        const service_ids = data.map(d => d.service_id);
        const services = await this.col_service.find({ _id: { $in: service_ids } }).toArray();
        return mongodb_1.FromMongoData.Many(services);
    }
    async RemoveService(location_id, service_id) {
        await this.col_location_service.deleteOne({ location_id: location_id, service_id: service_id });
    }
    async AddService(location_id, service_id) {
        const doc = mongodb_1.ToMongoData.One({ location_id: location_id, service_id: service_id });
        await this.col_location_service.insertOne(doc);
    }
    async ListLocationByService(service_id) {
        const data = await this.col_location_service.find({ service_id }).toArray();
        const location_ids = data.map(d => d.location_id);
        const locations = await this.col_location.find({ _id: { $in: location_ids } }).toArray();
        return mongodb_1.FromMongoData.Many(locations);
    }
    async ListLocationOfService(service_id) {
        const data = await this.col_location_service.find({ service_id: service_id }).toArray();
        const dataLocation = await this.col_location.find().toArray();
        const arr = [];
        for (let l of dataLocation) {
            for (let id of data) {
                if (l._id === id.location_id) {
                    arr.push(l);
                }
            }
        }
        return mongodb_1.FromMongoData.Many(arr);
    }
}
exports.LocationDALMongo = LocationDALMongo;
//# sourceMappingURL=location.dal.mongo.js.map