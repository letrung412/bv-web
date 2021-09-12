import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";
import { UploadNS } from "./upload";

export class UploadDALMongo implements UploadNS.DAL{
    constructor(
        private db : MongoDB
    ) { }

    async init() { }

    col_data_upload = this.db.collection("upload")

    async SaveData(data : UploadNS.Data) {
        try {
            const doc = ToMongoData.One(data);
            await this.col_data_upload.insertOne(doc);
        } catch(err) {
            if (err.code === MongoErrorCodes.Duplicate) {
                throw UploadNS.Errors.ErrDataIdExisted
            } else {
                throw err;
            }
        }
    }

    async Download(name : string) {
        const doc = await this.col_data_upload.findOne({name});
        return FromMongoData.One<UploadNS.Data>(doc);
    }

    async ListData(ref_id : string) {
        const docs = await this.col_data_upload.find({ref_id : ref_id}).toArray();
        return FromMongoData.Many<UploadNS.Data>(docs);
    }
}