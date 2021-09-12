import { ServiceNS } from '../service/service';
import { LocationNS } from './location';
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";

export class LocationDALMongo implements LocationNS.DAL {
    constructor(
        private db: MongoDB
    ) { }

    async init() {

    }

    private col_location = this.db.collection("location");
    private locationTypeCol = this.db.collection("location_type");

    async ListLocation() {
        const docs = await this.col_location.find().toArray();
        return FromMongoData.Many<LocationNS.Location>(docs);
    }

    async GetLocation(id: string) {
        const doc = await this.col_location.findOne({ _id: id });
        return FromMongoData.One<LocationNS.Location>(doc);
    }

    async UpdateLocation(location: LocationNS.Location) {
        const doc = ToMongoData.One(location);
        await this.col_location.updateOne({ _id: location.id }, { $set: doc });
    }

    async DeleteLocation(id: string) {
        await this.col_location.deleteOne({ _id: id });
    }

    async CreateLocation(location: LocationNS.Location) {
        const doc = ToMongoData.One(location);
        await this.col_location.insertOne(doc);
    }

    async ListLocationOfType(type: string) {
        const docs = await this.col_location.find({ location_type: type }).toArray();
        return FromMongoData.Many<LocationNS.Location>(docs);
    }

    async ListType() {
        const docs = await this.locationTypeCol.find().toArray();
        return FromMongoData.Many<LocationNS.Type>(docs);
    }

    async GetType(id: string) {
        const doc = await this.locationTypeCol.findOne({ _id: id });
        return FromMongoData.One<LocationNS.Type>(doc);
    }

    async UpdateType(locationType: LocationNS.Type) {
        const doc = ToMongoData.One(locationType);
        await this.locationTypeCol.updateOne({ _id: locationType.id }, { $set: doc });
    }

    async DeleteType(id: string) {
        await this.locationTypeCol.deleteOne({ _id: id });
    }

    async CreateType(locationType: LocationNS.Type) {
        const doc = ToMongoData.One(locationType);
        await this.locationTypeCol.insertOne(doc);
    }

    /// LOCATION_SERVICE
    private col_location_service = this.db.collection("location_service");
    private col_service = this.db.collection("service");

    async ListService(location_id: string) {
        const data = await this.col_location_service.find({ location_id }).toArray();
        const service_ids = data.map(d => d.service_id);
        const services = await this.col_service.find({ _id: { $in: service_ids } }).toArray();
        return FromMongoData.Many<ServiceNS.Service>(services);
    }

    async RemoveService(location_id: string, service_id: string) {
        await this.col_location_service.deleteOne({ location_id: location_id, service_id: service_id });
    }

    async AddService(location_id: string, service_id: string) {
        const doc = ToMongoData.One({ location_id: location_id, service_id: service_id });
        await this.col_location_service.insertOne(doc);
    }

    async ListLocationByService(service_id) {
        const data = await this.col_location_service.find({ service_id }).toArray();
        const location_ids = data.map(d => d.location_id);
        const locations = await this.col_location.find({ _id: { $in: location_ids } }).toArray();
        return FromMongoData.Many<LocationNS.Location>(locations);
    }
    async ListLocationOfService(service_id){
        const data = await this.col_location_service.find({service_id: service_id}).toArray();

        const dataLocation = await this.col_location.find().toArray();

        const arr = [];
        for (let l of dataLocation) {
            for (let id of data){
                if(l._id === id.location_id){
                    arr.push(l);                
                }
            }
        }

        return FromMongoData.Many<LocationNS.Location>(arr) ;
    }
}