import { JobNS } from "./job";
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes, MongoCommon } from "../lib/mongodb";
import { ContextNS } from "../ext/ctx";

export class JobDALMongo implements JobNS.DAL {
  constructor(
    private db: MongoDB
  ) { }

  async init() {
    this.col_job_step.createIndex('location_id');
    this.col_job_step.createIndex('job_id');
    this.col_job_step.createIndex('code', { unique: true });
  }

  private col_job = this.db.collection("job");
  private col_job_step = this.db.collection("job_step");

  async CreateJob(ctx: ContextNS.Context, job: JobNS.Job) {
    const doc = ToMongoData.One(job);
    const session = MongoCommon.Session(ctx);
    await this.col_job.insertOne(doc, { session });
  }

  async GetJob(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_job.findOne({ _id: id }, { session });
    return FromMongoData.One<JobNS.Job>(doc);
  }

  async UpdateJob(ctx: ContextNS.Context, job: JobNS.Job) {
    const session = MongoCommon.Session(ctx);
    const { modifiedCount } = await this.col_job.updateOne(
      { _id: job.id }, {
      $set: {
        modified_by : job.modified_by,
        state: job.state,
        mtime: job.mtime,
      }
    }, { session });
    return modifiedCount;
  }

  async GetStep(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_job_step.findOne({ _id: id }, { session });
  return FromMongoData.One<JobNS.Step>(doc);
  }

  async GetStepByCode(ctx: ContextNS.Context, code: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_job_step.findOne({ code }, { session });
    return FromMongoData.One<JobNS.Step>(doc);
  }

  async CreateStep(ctx: ContextNS.Context, step: JobNS.Step) {
    const doc = ToMongoData.One(step);
    const session = MongoCommon.Session(ctx);
    await this.col_job_step.insertOne(doc, { session });
  }

  async UpdateStep(ctx: ContextNS.Context, job_step: JobNS.Step) {
    const session = MongoCommon.Session(ctx);
    const doc = await ToMongoData.One(job_step);
    await this.col_job_step.updateOne({ _id: doc._id }, {
      $set: doc
    }, { session });
  }

  async ListStep(ctx: ContextNS.Context, query: JobNS.QueryStepParams) {
    const session = MongoCommon.Session(ctx);
    const filter = {} as any;
    if (query.location_id) {
      filter.location_id = query.location_id;
    }
    if (query.status) {
      filter.status = { $in: query.status };
    }
    if (query.job_id) {
      filter.job_id = query.job_id;
    }
    if (query.type) {
      filter.type = { $in: query.type };
    }
    const docs = await this.col_job_step.find(filter, { session }).toArray();
    const steps = FromMongoData.Many<JobNS.Step>(docs);
    return steps;
  }

  async ListJob(ctx: ContextNS.Context, query: JobNS.QueryJobParams) {
    const session = MongoCommon.Session(ctx);
    const filter = {} as any;
    if (Array.isArray(query.ref_id)) {
      filter.ref_id = { $in: query.ref_id };
    }
    if (query.date) {
      filter.date = query.date;
    }
    const docs = await this.col_job.find(filter, { session }).toArray();
    return FromMongoData.Many<JobNS.Job>(docs);
  }

  async CountJob(ctx: ContextNS.Context, query: JobNS.QueryJobParams) {
    const session = MongoCommon.Session(ctx);
    const filter = {} as any;
    if (Array.isArray(query.ref_id)) {
      filter.ref_id = { $in: query.ref_id };
    }
    if (query.date) {
      filter.date = query.date;
    }
    const count = await this.col_job.countDocuments(filter, { session });
    return count;
  }
}
