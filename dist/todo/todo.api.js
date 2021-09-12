"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewTodoAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const todo_1 = require("./todo");
const auth_api_middleware_1 = require("../auth/auth.api.middleware");
function NewTodoAPI(userAuthBLL, todoBLL) {
    const app = express();
    app.use(auth_api_middleware_1.NewAuthMiddleware(userAuthBLL));
    app.post("/todo/create", async (req, res) => {
        const { user_id } = auth_api_middleware_1.GetAuthData(req);
        const title = http_1.HttpParamValidators.MustBeString(req.body, "title", 2);
        const params = {
            user_id,
            title,
        };
        const todo = await todoBLL.CreateTodo(params);
        res.json(todo);
    });
    app.get("/todo/list", async (req, res) => {
        const { user_id } = auth_api_middleware_1.GetAuthData(req);
        const docs = await todoBLL.ListTodo(user_id);
        res.json(docs);
    });
    app.post("/todo/update", async (req, res) => {
        const todo_id = http_1.HttpParamValidators.MustBeString(req.body, "id");
        const params = {};
        if (req.body.title) {
            params.title = http_1.HttpParamValidators.MustBeString(req.body, "title", 2);
        }
        await todoBLL.UpdateTodo(todo_id, params);
        res.json(1);
    });
    app.get("/todo/get", async (req, res) => {
        const doc = await todoBLL.GetTodo(req.query.id);
        res.json(doc);
    });
    app.post("/todo/delete", async (req, res) => {
        const doc = await todoBLL.DeleteTodo(req.query.id);
        res.json(doc);
    });
    const commonErrors = new Set([...Object.values(todo_1.TodoNS.Errors)]);
    app.use((err, req, res, next) => {
        if (commonErrors.has(err)) {
            err = new http_1.HttpError(err.message, 400 /* BadRequest */);
        }
        next(err);
    });
    return app;
}
exports.NewTodoAPI = NewTodoAPI;
//# sourceMappingURL=todo.api.js.map