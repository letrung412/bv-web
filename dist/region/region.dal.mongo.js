"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class RegionDALMongo {
    constructor(db) {
        this.db = db;
        this.col_region = this.db.collection("region");
    }
    async init() { }
    async ListRegion(querry) {
        const docs = await this.col_region.find({ type: querry.type, parent_id: querry.parent_id }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetRegion(id) {
        const doc = await this.col_region.findOne({ id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetRegionByName(name) {
        const docs = await this.col_region.find({ name }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async CreateRegion(region) {
        const doc = mongodb_1.ToMongoData.One(region);
        await this.col_region.insertOne(doc);
    }
}
exports.RegionDALMongo = RegionDALMongo;
//# sourceMappingURL=region.dal.mongo.js.map