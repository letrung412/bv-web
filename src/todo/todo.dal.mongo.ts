import { TodoNS } from "./todo";
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";

export class TodoDALMongo implements TodoNS.DAL {
    constructor(
        private db: MongoDB
    ) { }

    async init() {

    }

    private col_todo = this.db.collection("todo");

    async ListTodo(user_id: string) {
        const docs = await this.col_todo.find({user_id}).toArray();
        return FromMongoData.Many<TodoNS.Todo>(docs);
    }

    async GetTodo(id: string) {
        const doc = await this.col_todo.findOne({ _id: id });
        return FromMongoData.One<TodoNS.Todo>(doc);
    }

    async UpdateTodo(todo: TodoNS.Todo) {
        const doc = ToMongoData.One(todo);
        await this.col_todo.updateOne({ _id: todo.id }, { $set: doc });
    }

    async DeleteTodo(id: string) {
        await this.col_todo.deleteOne({ _id: id });
    }

    async CreateTodo(todo: TodoNS.Todo) {
        const doc = ToMongoData.One(todo);
        await this.col_todo.insertOne(doc);
    }
}
