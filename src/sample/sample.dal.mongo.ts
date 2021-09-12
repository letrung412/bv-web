import { ContextNS } from "../ext/ctx";
import { FromMongoData, MongoCommon, MongoDB, MongoErrorCodes, ToMongoData } from "../lib/mongodb";
import { SampleNS } from "./sample";

export class SampleDALMongo implements SampleNS.DAL {
    constructor(
        private db : MongoDB
    ) { }
       
    async init() { 
        // this.col_sample.createIndex({_id : 1}, {name : "_id", unique : true, background : true});
    }

    private col_sample = this.db.collection("sample");

    async GetSample(ctx: ContextNS.Context, id : string) {
        const session = MongoCommon.Session(ctx);
        const doc = await this.col_sample.findOne({_id : id} , {session});
        return FromMongoData.One<SampleNS.Sample>(doc);
    }

    async ListSample(filter : Object) {
        const docs = await this.col_sample.find(filter).toArray();
        return FromMongoData.Many<SampleNS.Sample>(docs);
    }

    async CreateSample(sample : SampleNS.Sample) {
        try {
            const doc = ToMongoData.One(sample);
            await this.col_sample.insertOne(doc);
        }catch(err) {
            if (err.code == MongoErrorCodes.Duplicate) {
                throw SampleNS.Errors.ErrSampleIdExisted
            }
            else {
                throw err;
            }
        }
    }

    async PostResult(ctx: ContextNS.Context, sample : SampleNS.Sample) {
        try {
            const session = MongoCommon.Session(ctx);
            const doc = ToMongoData.One(sample);
            await this.col_sample.updateOne({_id : doc._id}, {$set : doc}, {session});
        }catch(err) {
            throw err;
        }
    }
}