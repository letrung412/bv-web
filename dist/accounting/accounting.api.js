"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAccountingAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const accounting_1 = require("./accounting");
const ctx_1 = require("../ext/ctx");
const auth_api_middleware_1 = require("../auth/auth.api.middleware");
const date_fns_1 = require("date-fns");
const export_excel_1 = require("../lib/export_excel");
const accounting_api_middleware_1 = require("./accounting.api.middleware");
function NewAccountingAPI(userAuthBLL, accountingBLL, jobBLL, orgBLL) {
    const app = express();
    const transaction_type = Object.values(accounting_1.AccountingNS.TransactionType);
    const book_status = Object.values(accounting_1.AccountingNS.BookStatus);
    app.post("/book/create", async (req, res) => {
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name');
        const params = {
            name
        };
        const ctx = ctx_1.ContextNS.New();
        const book = await accountingBLL.CreateBook(ctx, params);
        res.json(book);
    });
    app.get("/book/list", async (req, res) => {
        const status = http_1.HttpParamValidators.MustBeOneOf(req.query, 'status', book_status);
        const docs = await accountingBLL.ListBook(status);
        res.json(docs);
    });
    app.post("/book/update", async (req, res) => {
        const id = req.body.id;
        const name = http_1.HttpParamValidators.MustBeString(req.body, 'name');
        const status = http_1.HttpParamValidators.MustBeOneOf(req.body, 'status', book_status);
        const params = {
            name,
            status
        };
        const ctx = ctx_1.ContextNS.New();
        await accountingBLL.UpdateBook(ctx, id, params);
        res.json(1);
    });
    app.get("/transaction/export-excel", async (req, res) => {
        let min = date_fns_1.startOfDay(Date.now()).getTime();
        let max = date_fns_1.endOfDay(Date.now()).getTime();
        if (req.query.start_date) {
            min = date_fns_1.startOfDay(new Date(req.query.start_date)).getTime();
        }
        if (req.query.end_date) {
            max = date_fns_1.endOfDay(new Date(req.query.end_date)).getTime();
        }
        const query = {
            ctime: [min, max]
        };
        query.create_by = http_1.HttpParamValidators.MustBeString(req.query, "user_id", 2);
        const ctx = ctx_1.ContextNS.New();
        const docs = await accountingBLL.ListTransaction(ctx, query);
        const user = await orgBLL.GetUser(query.create_by);
        const space_cell = "";
        const title = [space_cell, space_cell, space_cell, `BẢNG KÊ THU CHI`];
        const end_date = [`Đến : ${date_fns_1.format(query.ctime[1], "dd/MM/yyyy")}`];
        const start_date = [space_cell, `Từ : ${date_fns_1.format(query.ctime[0], "dd/MM/yyyy")}`, ...end_date];
        const header = [title, start_date];
        const revuene = await accounting_api_middleware_1.ComputeRevuene(docs, jobBLL);
        const file_name = `${export_excel_1.removeVietnameseTones(user.full_name)}-${date_fns_1.format(query.ctime[0], "dd/MM/yyyy")}-${date_fns_1.format(query.ctime[1], "dd/MM/yyyy")}`;
        const signature = {
            [accounting_api_middleware_1.DATA_FORM.full_name]: `${user.full_name}`
        };
        revuene.data.push(signature);
        return export_excel_1.ExportExcel(req, res, revuene.data, header, user.full_name, file_name);
    });
    app.use(auth_api_middleware_1.NewAuthMiddleware(userAuthBLL));
    app.post("/transaction/create", async (req, res) => {
        const ref = http_1.HttpParamValidators.MustBeString(req.body, 'ref');
        if (ref !== "order" && ref !== "retail") {
            throw new http_1.HttpError("ref must be [order, retail]", 400);
        }
        const ref_id = http_1.HttpParamValidators.MustBeString(req.body, 'ref_id');
        const book_id = http_1.HttpParamValidators.MustBeString(req.body, 'book_id');
        const amount = req.body.amount;
        const session = auth_api_middleware_1.GetAuthData(req);
        const create_by = session.user_id;
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, 'type', transaction_type);
        const note = http_1.HttpParamValidators.MustBeString(req.body, 'note');
        const params = {
            ref: ref,
            ref_id,
            book_id,
            create_by,
            amount,
            type,
            note
        };
        const ctx = ctx_1.ContextNS.New();
        const doc = await accountingBLL.CreateTransaction(ctx, params);
        res.json(doc);
    });
    app.get("/transaction/list", async (req, res) => {
        let min = date_fns_1.startOfDay(Date.now()).getTime();
        let max = date_fns_1.endOfDay(Date.now()).getTime();
        if (req.query.start_date) {
            min = date_fns_1.startOfDay(new Date(req.query.start_date)).getTime();
        }
        if (req.query.end_date) {
            max = date_fns_1.endOfDay(new Date(req.query.end_date)).getTime();
        }
        const query = {
            ctime: [min, max]
        };
        if (req.query.user_id) {
            query.create_by = http_1.HttpParamValidators.MustBeString(req.query, "user_id");
        }
        const ctx = ctx_1.ContextNS.New();
        const docs = await accountingBLL.ListTransaction(ctx, query);
        const revuene = await accounting_api_middleware_1.ComputeRevuene(docs, jobBLL);
        res.json({
            count: docs.length,
            revuene: revuene.revuene,
            records: revuene.transactions,
        });
    });
    app.get("/transaction/get", async (req, res) => {
        const id = req.query.id;
        const doc = await accountingBLL.GetTransaction(id);
        res.json(doc);
    });
    return app;
}
exports.NewAccountingAPI = NewAccountingAPI;
