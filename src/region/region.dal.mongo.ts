import { FromMongoData, MongoDB, ToMongoData, MongoCommon } from "../lib/mongodb";
import { RegionNS } from "./region";

export class RegionDALMongo implements RegionNS.DAL {
    constructor (private db : MongoDB) { }

    async init() { }
    private col_region = this.db.collection("region");

    async ListRegion(querry : RegionNS.QuerryRegionParams) {
        const docs = await this.col_region.find({type : querry.type , parent_id : querry.parent_id}).toArray();
        return FromMongoData.Many<RegionNS.Region>(docs);
    }

    async GetRegion(id : string) {
        const doc = await this.col_region.findOne({id : id});
        return FromMongoData.One<RegionNS.Region>(doc);
    }

    async GetRegionByName(name : string) {
        const docs = await this.col_region.find({name}).toArray();
        return FromMongoData.Many<RegionNS.Region>(docs);
    }

    async CreateRegion(region : RegionNS.Region) {
        const doc = ToMongoData.One(region)
        await this.col_region.insertOne(doc);
    }
}