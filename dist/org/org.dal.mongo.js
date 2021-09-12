"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
const org_1 = require("./org");
class OrgDALMongo {
    constructor(db) {
        this.db = db;
        this.col_org = this.db.collection("org");
        this.col_user = this.db.collection("user");
    }
    async init() {
        this.col_user.createIndex("username", { unique: true });
    }
    async ListOrg() {
        const docs = await this.col_org.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async CreateOrg(org) {
        const doc = mongodb_1.ToMongoData.One(org);
        await this.col_org.insertOne(doc);
    }
    async ListUser() {
        const docs = await this.col_user.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetUser(id) {
        const doc = await this.col_user.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetUserByUsername(username) {
        const doc = await this.col_user.findOne({ username: username });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateUser(user) {
        try {
            const doc = mongodb_1.ToMongoData.One(user);
            await this.col_user.insertOne(doc);
        }
        catch (err) {
            if (err.code === 11000 /* Duplicate */) {
                throw org_1.OrgNS.Errors.ErrUsernameExisted;
            }
            else {
                throw err;
            }
        }
    }
    async UpdateUser(user) {
        const doc = mongodb_1.ToMongoData.One(user);
        await this.col_user.updateOne({ _id: user.id }, { $set: doc });
    }
    async DeleteUser(id) {
        await this.col_user.deleteOne({ _id: id });
    }
}
exports.OrgDALMongo = OrgDALMongo;
//# sourceMappingURL=org.dal.mongo.js.map