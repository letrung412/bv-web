import rand from "../lib/rand";
export namespace RegionNS {
    export interface Region {
        id : string;
        zip_code? : string;
        name : string;
        type : Type;
        parent_id : string;
        ctime : number;
        mtime : number;
    }

    export enum Type {
        province = "province",
        district = "district",
        ward = "ward"
    }

    export interface CreateRegionParams {
        zip_code : string;
        name : string;
        type : Type;
        parent_id : string;
    }

    export interface UpdateRegionParams {
        zip_code? : string;
        name? : string;
        type? : Type;
    }

    export interface QuerryRegionParams {
        type : Type;
        parent_id : string;
    }

    // export interface 
    export interface BLL {
        ListRegion(query : QuerryRegionParams) : Promise<Region[]>;
        GetRegion(id: string) : Promise<Region>;
        GetRegionByName(name : string) : Promise<Region[]>;
        CreateRegion(params: CreateRegionParams) : Promise<Region>;
    }

    export interface DAL {
        ListRegion(query : QuerryRegionParams) : Promise<Region[]>;
        GetRegion(text : string) : Promise<Region>;
        GetRegionByName(name : string) : Promise<Region[]>;
        CreateRegion(region : RegionNS.Region) : Promise<void>;
    }

    export const Errors = {
        RegionNotFound : new Error("Region not found")
    }

    export const Generator = {
        NewRegionId : () => rand.alphabet(12)
    }
}