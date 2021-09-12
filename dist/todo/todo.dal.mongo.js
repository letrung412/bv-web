"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoDALMongo = void 0;
const mongodb_1 = require("../lib/mongodb");
class TodoDALMongo {
    constructor(db) {
        this.db = db;
        this.col_todo = this.db.collection("todo");
    }
    async init() {
    }
    async ListTodo(user_id) {
        const docs = await this.col_todo.find({ user_id }).toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetTodo(id) {
        const doc = await this.col_todo.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateTodo(todo) {
        const doc = mongodb_1.ToMongoData.One(todo);
        await this.col_todo.updateOne({ _id: todo.id }, { $set: doc });
    }
    async DeleteTodo(id) {
        await this.col_todo.deleteOne({ _id: id });
    }
    async CreateTodo(todo) {
        const doc = mongodb_1.ToMongoData.One(todo);
        await this.col_todo.insertOne(doc);
    }
}
exports.TodoDALMongo = TodoDALMongo;
