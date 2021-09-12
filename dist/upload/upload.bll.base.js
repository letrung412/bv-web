"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadBLLBase = void 0;
const upload_1 = require("./upload");
class UploadBLLBase {
    constructor(dal) {
        this.dal = dal;
    }
    async init() { }
    async SaveData(params) {
        const doc = {
            id: upload_1.UploadNS.Generator.NewDataId(),
            ref: "job_step",
            ref_id: params.ref_id,
            type: upload_1.UploadNS.Type.Image,
            name: params.name,
            metadata: params.metadata,
            url: params.url,
            size: params.size,
            ctime: Date.now()
        };
        await this.dal.SaveData(doc);
        return doc;
    }
    async GetData(name) {
        const doc = await this.dal.Download(name);
        if (!doc) {
            throw upload_1.UploadNS.Errors.ErrDataNotFound;
        }
        return doc;
    }
    async Download(name) {
        const doc = await this.dal.Download(name);
        if (!doc) {
            throw upload_1.UploadNS.Errors.ErrDataNotFound;
        }
        return doc.url;
    }
    async ListData(ref_id) {
        const docs = await this.dal.ListData(ref_id);
        return docs;
    }
}
exports.UploadBLLBase = UploadBLLBase;
