import * as express from 'express';
import { HttpError, HttpStatusCodes, HttpParamValidators } from '../lib/http';
import { AccountingNS } from './accounting';
import { ContextNS } from '../ext/ctx';
import { UserAuthNS } from '../auth/auth';
import { GetAuthData, NewAuthMiddleware } from '../auth/auth.api.middleware';
import { format, endOfDay, startOfDay } from 'date-fns';
import { JobNS } from '../job/job';
import { ExportExcel, removeVietnameseTones } from '../lib/export_excel';
import { OrgNS } from '../org/org';
import { ComputeRevuene , DATA_FORM } from './accounting.api.middleware';

export function NewAccountingAPI(
    userAuthBLL: UserAuthNS.BLL,
    accountingBLL: AccountingNS.BLL,
    jobBLL: JobNS.BLL,
    orgBLL: OrgNS.BLL
) {
    const app = express();
    const transaction_type = Object.values(AccountingNS.TransactionType);
    const book_status = Object.values(AccountingNS.BookStatus);

    app.post("/book/create", async (req, res) => {
        const name = HttpParamValidators.MustBeString(req.body, 'name');
        const params: AccountingNS.CreateBook = {
            name
        }
        const ctx = ContextNS.New();
        const book = await accountingBLL.CreateBook(ctx, params);
        res.json(book);
    })

    app.get("/book/list", async (req, res) => {
        const status = HttpParamValidators.MustBeOneOf(req.query, 'status', book_status);
        const docs = await accountingBLL.ListBook(status);
        res.json(docs);
    });

    app.post("/book/update", async (req, res) => {
        const id = req.body.id;
        const name = HttpParamValidators.MustBeString(req.body, 'name');
        const status = HttpParamValidators.MustBeOneOf(req.body, 'status', book_status);
        const params: AccountingNS.UpdateBook = {
            name,
            status
        }
        const ctx = ContextNS.New();
        await accountingBLL.UpdateBook(ctx, id, params);
        res.json(1);
    })

    app.get("/transaction/export-excel", async (req, res) => {
        let min = startOfDay(Date.now()).getTime();
        let max = endOfDay(Date.now()).getTime();
        if (req.query.start_date) {
            min = startOfDay(new Date(req.query.start_date as string)).getTime();
        }
        if (req.query.end_date) {
            max = endOfDay(new Date(req.query.end_date as string)).getTime();
        }
        const query: AccountingNS.QueryTransactionParams = { 
            ctime : [min , max]
        };
        query.create_by = HttpParamValidators.MustBeString(req.query, "user_id", 2);
        const ctx = ContextNS.New();
        const docs = await accountingBLL.ListTransaction(ctx, query);
        const user = await orgBLL.GetUser(query.create_by);
        const space_cell = "";
        const title = [space_cell, space_cell, space_cell, `BẢNG KÊ THU CHI`];
        const end_date = [`Đến : ${format(query.ctime[1], "dd/MM/yyyy")}`];
        const start_date = [space_cell ,`Từ : ${format(query.ctime[0], "dd/MM/yyyy")}`,...end_date];
        const header = [title, start_date ];
        const revuene = await ComputeRevuene(docs, jobBLL);
        const file_name = `${removeVietnameseTones(user.full_name)}-${format(query.ctime[0], "dd/MM/yyyy")}-${format(query.ctime[1], "dd/MM/yyyy")}`;
        const signature = {
            [DATA_FORM.full_name] : `${user.full_name}`
        }
        revuene.data.push(signature);
        return ExportExcel(req, res, revuene.data, header, user.full_name, file_name);
    })

    app.use(NewAuthMiddleware(userAuthBLL));
    app.post("/transaction/create", async (req, res) => {
        const ref = HttpParamValidators.MustBeString(req.body, 'ref');
        if (ref !== "order" && ref !== "retail") {
            throw new HttpError("ref must be [order, retail]", 400);
        }
        const ref_id = HttpParamValidators.MustBeString(req.body, 'ref_id');
        const book_id = HttpParamValidators.MustBeString(req.body, 'book_id');
        const amount = req.body.amount;
        const session = GetAuthData(req);
        const create_by = session.user_id;
        const type = HttpParamValidators.MustBeOneOf(req.body, 'type', transaction_type);
        const note = HttpParamValidators.MustBeString(req.body, 'note');
        const params: AccountingNS.CreateTransaction = {
            ref: ref,
            ref_id,
            book_id,
            create_by,
            amount,
            type,
            note
        };
        const ctx = ContextNS.New();
        const doc = await accountingBLL.CreateTransaction(ctx, params);
        res.json(doc);
    });

    app.get("/transaction/list", async (req, res) => {
        let min = startOfDay(Date.now()).getTime();
        let max = endOfDay(Date.now()).getTime();
        if (req.query.start_date) {
            min = startOfDay(new Date(req.query.start_date as string)).getTime();
        }
        if (req.query.end_date) {
            max = endOfDay(new Date(req.query.end_date as string)).getTime();
        }
        const query: AccountingNS.QueryTransactionParams = {
            ctime : [min, max]
        }
        if (req.query.user_id) {
            query.create_by = HttpParamValidators.MustBeString(req.query, "user_id");
        }
        const ctx = ContextNS.New();
        const docs = await accountingBLL.ListTransaction(ctx, query);
        const revuene = await ComputeRevuene(docs,jobBLL);
        res.json({
            count: docs.length,
            revuene: revuene.revuene,
            records: revuene.transactions,
        });
    });

    app.get("/transaction/get", async (req, res) => {
        const id = (req.query as any).id
        const doc = await accountingBLL.GetTransaction(id);
        res.json(doc);
    });

    return app;
}