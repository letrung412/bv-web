import { RegionNS } from "./region";

export class RegionBLLBase implements RegionNS.BLL {
    constructor (private dal : RegionNS.DAL) {}

    async init() { }

    async ListRegion(query : RegionNS.QuerryRegionParams) {
        const docs = await this.dal.ListRegion(query);
        return docs;
    }

    async GetRegion(id : string) {
        const doc = await this.dal.GetRegion(id);
        if (!doc) {
            throw RegionNS.Errors.RegionNotFound;
        }
        return doc;
    }

    async GetRegionByName(name : string) {
        const docs = await this.dal.GetRegionByName(name);
        if (!docs) {
            throw RegionNS.Errors.RegionNotFound;
        }
        return docs;
    }

    async CreateRegion(params : RegionNS.CreateRegionParams) {
        const now = Date.now();
        if (params.type === RegionNS.Type.province) {
            params.parent_id = "VN"
        }
        const region : RegionNS.Region = {
            id : RegionNS.Generator.NewRegionId(),
            zip_code : params.zip_code,
            name : params.name,
            type : params.type,
            parent_id : params.parent_id,
            ctime: now,
            mtime : now,
        }
        await this.dal.CreateRegion(region);
        return region;
    }
}