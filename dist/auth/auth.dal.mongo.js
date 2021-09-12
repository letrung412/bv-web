"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class UserAuthDALMongo {
    constructor(db) {
        this.db = db;
        this.col_user_secret = this.db.collection("user_secret");
        this.col_user_session = this.db.collection("user_session");
    }
    async init() {
        await this.col_user_secret.createIndex("user_id");
    }
    async SaveUserSecret(obj) {
        await this.col_user_secret.updateOne({
            user_id: obj.user_id,
            name: obj.name
        }, {
            $set: {
                user_id: obj.user_id,
                name: obj.name,
                value: obj.value,
                encode: obj.encode,
            }
        }, { upsert: true });
    }
    async GetUserSecret(user_id, name) {
        const doc = await this.col_user_secret.findOne({ user_id, name });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateUserSession(session) {
        const doc = mongodb_1.ToMongoData.One(session);
        await this.col_user_session.insertOne(doc);
    }
    async GetUserSession(id) {
        const doc = await this.col_user_session.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetSessionByUser(user_id) {
        const docs = await this.col_user_session.find({ user_id }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async DisableSession(session) {
        const doc = mongodb_1.ToMongoData.One(session);
        await this.col_user_session.updateOne({ _id: session.id }, { $set: doc });
    }
}
exports.UserAuthDALMongo = UserAuthDALMongo;
//# sourceMappingURL=auth.dal.mongo.js.map