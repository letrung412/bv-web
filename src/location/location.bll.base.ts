import { ServiceNS } from '../service/service';
import { LocationNS } from './location';

export class LocationBLLBase implements LocationNS.BLL {
    constructor(
        private dal: LocationNS.DAL,
        private serviceBLL : ServiceNS.BLL
    ) { }

    async init() { }

    async ListLocation() {
        const docs = await this.dal.ListLocation(); 
        return docs.sort((a,b) => a.code.localeCompare(b.code));
    }

    async ListLocationOfType(type: string) {
        return this.dal.ListLocationOfType(type);
    }

    async GetLocation(id: string) {
        const location = await this.dal.GetLocation(id);
        if (!location) {
            throw LocationNS.Errors.ErrLocationNotFound;
        }
        return location;
    }

    async DeleteLocation(id: string) {
        const location = await this.GetLocation(id);
        await this.dal.DeleteLocation(id);
        return location;
    }

    async UpdateLocation(id: string, params: LocationNS.UpdateLocationParams) {
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

    async CreateLocation(params: LocationNS.CreateLocationParams) {
        const now = Date.now();
        const location: LocationNS.Location = {
            id: LocationNS.Generator.NewLocationId(),
            type: params.type,
            name: params.name,
            code: params.code,
            ctime: now,
            mtime: now,
        }
        await this.dal.CreateLocation(location);
        return location;
    }

    async ListType() {
        return this.dal.ListType();
    }

    async GetType(id: string) {
        const locationType = await this.dal.GetType(id);
        if (!locationType) {
            throw LocationNS.Errors.ErrTypeNotFound;
        }
        return locationType;
    }

    async DeleteType(id: string) {
        const locationType = await this.GetType(id);
        await this.dal.DeleteType(id);
        return locationType;
    }

    async UpdateType(id: string, params: LocationNS.UpdateTypeParams) {
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

    async CreateType(params: LocationNS.CreateTypeParams) {
        const now = Date.now();
        const locationType: LocationNS.Type = {
            id: LocationNS.Generator.NewLocationTypeId(),
            name: params.name,
            code: params.code,
            ctime: now,
            mtime: now,
        }

        await this.dal.CreateType(locationType);
        return locationType;
    }

    ////LOCATION_SERVICE
    async AddService(location_id: string, service_id: string) {
        const service = await this.serviceBLL.GetService(service_id);
        const location = await this.dal.GetLocation(location_id);
        const service_name = service.name;
        const location_name = location.name;
        await this.dal.AddService(location_id, service_id);
        return { service_name , location_name}
    }

    async ListService(location_id: string) {
        return await this.dal.ListService(location_id);
    }

    async RemoveService(location_id: string, service_id: string) {
        return this.dal.RemoveService(location_id, service_id);
    }

    async ListLocationByService(service_id: string) {
        return this.dal.ListLocationByService(service_id);
    }

}