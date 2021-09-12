import rand from "../lib/rand";
import { TodoNS } from "./todo";

export class TodoBLLBase implements TodoNS.BLL {
    constructor(
        private dal: TodoNS.DAL,
    ) { }

    async init() {

    }

    async ListTodo(user_id: string) {
        return this.dal.ListTodo(user_id);
    }

    async GetTodo(id: string) {
        const todo = await this.dal.GetTodo(id);
        if (!todo) {
            throw TodoNS.Errors.ErrTodoNotFound;
        }
        return todo;
    }

    async DeleteTodo(id: string) {
        const todo = await this.GetTodo(id);
        await this.dal.DeleteTodo(id);
    }

    async UpdateTodo(todo_id: string, params: TodoNS.UpdateTodoParams) {
        const todo = await this.GetTodo(todo_id);
        if (params.title) {
            todo.title = params.title;
        }
        todo.mtime = Date.now();
        await this.dal.UpdateTodo(todo);
        return todo;
    }

    async CreateTodo(params: TodoNS.CreateTodoParams) {
        const now = Date.now();
        const todo: TodoNS.Todo = {
            id: rand.uppercase(8),
            user_id: params.user_id,
            title: params.title,
            ctime: now,
            mtime: now,
        }
        await this.dal.CreateTodo(todo);
        return todo;
    }
}