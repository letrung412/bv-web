import { FromMongoData, MongoDB, ToMongoData, MongoErrorCodes } from "../lib/mongodb";
import { OrgNS } from "./org";

export class OrgDALMongo implements OrgNS.DAL {
  constructor(private db: MongoDB) { }

  async init() {
    this.col_user.createIndex("username", { unique: true });
  }

  private col_org = this.db.collection("org");
  private col_user = this.db.collection("user");

  async ListOrg() {
    const docs = await this.col_org.find().toArray();
    return FromMongoData.Many<OrgNS.Org>(docs);
  }

  async CreateOrg(org: OrgNS.Org) {
    const doc = ToMongoData.One(org);
    await this.col_org.insertOne(doc);
  }

  async ListUser() {
    const docs = await this.col_user.find().toArray();
    return FromMongoData.Many<OrgNS.User>(docs);
  }

  async GetUser(id: string) {
    const doc = await this.col_user.findOne({ _id: id });
    return FromMongoData.One<OrgNS.User>(doc);
  }

  async GetUserByUsername(username: string) {
    const doc = await this.col_user.findOne({ username: username });
    return FromMongoData.One<OrgNS.User>(doc);
  }

  async CreateUser(user: OrgNS.User) {
    try {
      const doc = ToMongoData.One(user);
      await this.col_user.insertOne(doc);
    } catch (err) {
      if (err.code === MongoErrorCodes.Duplicate) {
        throw OrgNS.Errors.ErrUsernameExisted;
      } else {
        throw err;
      }
    }
  }

  async UpdateUser(user: OrgNS.User) {
    const doc = ToMongoData.One(user);
    await this.col_user.updateOne({ _id: user.id }, { $set: doc });
  }

  async DeleteUser(id: string) {
    await this.col_user.deleteOne({ _id: id });
  }
}
