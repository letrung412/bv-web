import { ServiceNS } from '../service/service';
import rand from '../lib/rand';

export namespace LocationNS {
    export interface Location {
        id: string;
        type: string;
        name: string;
        code: string;
        ctime: number;
        mtime: number;
    }

    export interface CreateLocationParams {
        type: string;
        name: string;
        code: string;
    }

    export interface UpdateLocationParams {
        name?: string;
        type?: string;
        code?: string;
    }
    export interface Type {
        id: string;
        code: string;
        name: string;
        ctime: number;
        mtime: number;
    }

    export interface CreateTypeParams {
        code: string;
        name: string;
    }

    export interface UpdateTypeParams {
        name?: string;
        code?: string;
    }

    export interface BLL {
        ListLocation(): Promise<Location[]>;
        ListLocationOfType(type: string): Promise<Location[]>;
        GetLocation(id: string): Promise<Location>;
        CreateLocation(params: CreateLocationParams): Promise<Location>;
        UpdateLocation(id: string, params: UpdateLocationParams): Promise<void>;
        DeleteLocation(id: string): Promise<Location>


        ListType(): Promise<Type[]>;
        GetType(id: string): Promise<Type>;
        CreateType(params: CreateTypeParams): Promise<Type>;
        UpdateType(id: string, params: UpdateTypeParams): Promise<void>;
        DeleteType(id: string): Promise<Type>;

        AddService(location_id: string, service_id: string): Promise<object>;
        RemoveService(location_id: string, service_id: string): Promise<void>;
        ListService(location_id: string): Promise<ServiceNS.Service[]>;
        ListLocationByService(service_id: string): Promise<LocationNS.Location[]>;
    }

    export interface DAL {
        ListLocation(): Promise<Location[]>;
        ListLocationOfType(type: string): Promise<Location[]>;
        GetLocation(id: string): Promise<Location>;
        CreateLocation(Location: Location): Promise<void>;
        UpdateLocation(Location: Location): Promise<void>;
        DeleteLocation(id: string): Promise<void>

        ListType(): Promise<Type[]>;
        GetType(id: string): Promise<Type>;
        CreateType(Type: Type): Promise<void>;
        UpdateType(Type: Type): Promise<void>;
        DeleteType(id: string): Promise<void>

        AddService(location_id: string, service_id: string): Promise<void>;
        RemoveService(location_id: string, service_id: string): Promise<void>;
        ListService(location_id: string): Promise<ServiceNS.Service[]>;
        ListLocationByService(service_id: string): Promise<LocationNS.Location[]>;
    }

    export const Errors = {
        ErrLocationNotFound: new Error("Location not found!"),
        ErrTypeNotFound: new Error("LocationType not found!")
    }

    export const Generator = {
        NewLocationId: () => rand.uppercase(10), // colision 2^25
        NewLocationTypeId: () => rand.uppercase(8), // collision 2^20
    };
}