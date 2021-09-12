"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
const upload_1 = require("./upload");
class UploadDALMongo {
    constructor(db) {
        this.db = db;
        this.col_data_upload = this.db.collection("upload");
    }
    async init() { }
    async SaveData(data) {
        try {
            const doc = mongodb_1.ToMongoData.One(data);
            await this.col_data_upload.insertOne(doc);
        }
        catch (err) {
            if (err.code === 11000 /* Duplicate */) {
                throw upload_1.UploadNS.Errors.ErrDataIdExisted;
            }
            else {
                throw err;
            }
        }
    }
    async Download(name) {
        const doc = await this.col_data_upload.findOne({ name });
        return mongodb_1.FromMongoData.One(doc);
    }
    async ListData(ref_id) {
        const docs = await this.col_data_upload.find({ ref_id: ref_id }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
}
exports.UploadDALMongo = UploadDALMongo;
//# sourceMappingURL=upload.dal.mongo.js.map