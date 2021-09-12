"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionBLLBase = void 0;
const region_1 = require("./region");
class RegionBLLBase {
    constructor(dal) {
        this.dal = dal;
    }
    async init() { }
    async ListRegion(query) {
        const docs = await this.dal.ListRegion(query);
        return docs;
    }
    async GetRegion(id) {
        const doc = await this.dal.GetRegion(id);
        if (!doc) {
            throw region_1.RegionNS.Errors.RegionNotFound;
        }
        return doc;
    }
    async GetRegionByName(name) {
        const docs = await this.dal.GetRegionByName(name);
        if (!docs) {
            throw region_1.RegionNS.Errors.RegionNotFound;
        }
        return docs;
    }
    async CreateRegion(params) {
        const now = Date.now();
        if (params.type === region_1.RegionNS.Type.province) {
            params.parent_id = "VN";
        }
        const region = {
            id: region_1.RegionNS.Generator.NewRegionId(),
            zip_code: params.zip_code,
            name: params.name,
            type: params.type,
            parent_id: params.parent_id,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateRegion(region);
        return region;
    }
}
exports.RegionBLLBase = RegionBLLBase;
