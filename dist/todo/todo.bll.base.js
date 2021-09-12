"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoBLLBase = void 0;
const rand_1 = require("../lib/rand");
const todo_1 = require("./todo");
class TodoBLLBase {
    constructor(dal) {
        this.dal = dal;
    }
    async init() {
    }
    async ListTodo(user_id) {
        return this.dal.ListTodo(user_id);
    }
    async GetTodo(id) {
        const todo = await this.dal.GetTodo(id);
        if (!todo) {
            throw todo_1.TodoNS.Errors.ErrTodoNotFound;
        }
        return todo;
    }
    async DeleteTodo(id) {
        const todo = await this.GetTodo(id);
        await this.dal.DeleteTodo(id);
    }
    async UpdateTodo(todo_id, params) {
        const todo = await this.GetTodo(todo_id);
        if (params.title) {
            todo.title = params.title;
        }
        todo.mtime = Date.now();
        await this.dal.UpdateTodo(todo);
        return todo;
    }
    async CreateTodo(params) {
        const now = Date.now();
        const todo = {
            id: rand_1.default.uppercase(8),
            user_id: params.user_id,
            title: params.title,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateTodo(todo);
        return todo;
    }
}
exports.TodoBLLBase = TodoBLLBase;
//# sourceMappingURL=todo.bll.base.js.map