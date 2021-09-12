"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationBLLBase = void 0;
const location_1 = require("./location");
class LocationBLLBase {
    constructor(dal, serviceBLL) {
        this.dal = dal;
        this.serviceBLL = serviceBLL;
    }
    async init() { }
    async ListLocation() {
        const docs = await this.dal.ListLocation();
        return docs.sort((a, b) => a.code.localeCompare(b.code));
    }
    async ListLocationOfType(type) {
        return this.dal.ListLocationOfType(type);
    }
    async GetLocation(id) {
        const location = await this.dal.GetLocation(id);
        if (!location) {
            throw location_1.LocationNS.Errors.ErrLocationNotFound;
        }
        return location;
    }
    async DeleteLocation(id) {
        const location = await this.GetLocation(id);
        await this.dal.DeleteLocation(id);
        return location;
    }
    async UpdateLocation(id, params) {
        const location = await this.GetLocation(id);
        if (params.name) {
            location.name = params.name;
        }
        if (params.type) {
            location.type = params.type;
        }
        if (params.code) {
            location.code = params.code;
        }
        location.mtime = Date.now();
        await this.dal.UpdateLocation(location);
    }
    async CreateLocation(params) {
        const now = Date.now();
        const location = {
            id: location_1.LocationNS.Generator.NewLocationId(),
            type: params.type,
            name: params.name,
            code: params.code,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateLocation(location);
        return location;
    }
    async ListType() {
        return this.dal.ListType();
    }
    async GetType(id) {
        const locationType = await this.dal.GetType(id);
        if (!locationType) {
            throw location_1.LocationNS.Errors.ErrTypeNotFound;
        }
        return locationType;
    }
    async DeleteType(id) {
        const locationType = await this.GetType(id);
        await this.dal.DeleteType(id);
        return locationType;
    }
    async UpdateType(id, params) {
        const locationType = await this.GetType(id);
        if (params.name) {
            locationType.name = params.name;
        }
        if (params.code) {
            locationType.code = params.code;
        }
        locationType.mtime = Date.now();
        await this.dal.UpdateType(locationType);
    }
    async CreateType(params) {
        const now = Date.now();
        const locationType = {
            id: location_1.LocationNS.Generator.NewLocationTypeId(),
            name: params.name,
            code: params.code,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateType(locationType);
        return locationType;
    }
    ////LOCATION_SERVICE
    async AddService(location_id, service_id) {
        const service = await this.serviceBLL.GetService(service_id);
        const location = await this.dal.GetLocation(location_id);
        const service_name = service.name;
        const location_name = location.name;
        await this.dal.AddService(location_id, service_id);
        return { service_name, location_name };
    }
    async ListService(location_id) {
        return await this.dal.ListService(location_id);
    }
    async RemoveService(location_id, service_id) {
        return this.dal.RemoveService(location_id, service_id);
    }
    async ListLocationByService(service_id) {
        return this.dal.ListLocationByService(service_id);
    }
}
exports.LocationBLLBase = LocationBLLBase;
