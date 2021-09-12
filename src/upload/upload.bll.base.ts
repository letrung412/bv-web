import { UploadNS } from "./upload";

export class UploadBLLBase implements UploadNS.BLL {
    constructor(
        private dal : UploadNS.DAL
    ) { }
    
    async init() { }
    
    async SaveData(params : UploadNS.CreateDataParams) {
        const doc : UploadNS.Data = {
            id : UploadNS.Generator.NewDataId(),
            ref : "job_step",
            ref_id : params.ref_id,
            type : UploadNS.Type.Image,
            name : params.name,
            metadata : params.metadata,
            url : params.url,
            size : params.size,
            ctime : Date.now()
        }
        await this.dal.SaveData(doc);
        return doc;
    }

    async GetData(name : string) {
        const doc = await this.dal.Download(name);
        if (!doc) {
            throw UploadNS.Errors.ErrDataNotFound
        }
        return doc;
    }

    async Download(name : string) {
        const doc = await this.dal.Download(name);
        if (!doc) {
            throw UploadNS.Errors.ErrDataNotFound
        }
        return doc.url;
    }

    async ListData(ref_id : string) {
        const docs = await this.dal.ListData(ref_id);
        return docs;
    }
}