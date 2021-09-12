"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingBLLBase = void 0;
const accounting_1 = require("./accounting");
const rand_1 = require("../lib/rand");
class AccountingBLLBase {
    constructor(dal, contextBLL, orderBLL, retailBLL, orgBLL) {
        this.dal = dal;
        this.contextBLL = contextBLL;
        this.orderBLL = orderBLL;
        this.retailBLL = retailBLL;
        this.orgBLL = orgBLL;
    }
    async init() { }
    async ListBook(status) {
        const book = this.dal.ListBook(status);
        return book;
    }
    async GetBook(ctx, id) {
        const book = await this.dal.GetBook(ctx, id);
        if (!book) {
            throw accounting_1.AccountingNS.Errors.ErrBookNotFound;
        }
        return book;
    }
    async CreateBook(ctx, params) {
        const now = Date.now();
        const status = accounting_1.AccountingNS.BookStatus.Inactive;
        const book = {
            id: rand_1.default.uppercase(8),
            name: params.name,
            status: status,
            total: 0,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateBook(ctx, book);
        return book;
    }
    async UpdateBook(ctx, id, params) {
        const book = await this.GetBook(ctx, id);
        book.name = params.name;
        book.status = params.status;
        await this.dal.UpdateBook(ctx, book);
    }
    async ListTransaction(ctx, query) {
        const transactions = await this.dal.ListTransaction(query);
        const view_transactions = await Promise.all(transactions.map(async (transaction) => {
            let order;
            if (transaction.ref == "order") {
                order = await this.orderBLL.ViewOrder(ctx, transaction.ref_id);
            }
            if (transaction.ref == "retail") {
                order = await this.retailBLL.GetOrder(ctx, transaction.ref_id);
            }
            const view_transaction = {
                ...transaction,
                order
            };
            return view_transaction;
        }));
        return view_transactions;
    }
    async GetTransaction(id) {
        const transaction = await this.dal.GetTransaction(id);
        if (!transaction) {
            throw accounting_1.AccountingNS.Errors.ErrBookNotFound;
        }
        return transaction;
    }
    async CreateTransaction(ctx, params) {
        if (params.amount < 0) {
            throw accounting_1.AccountingNS.Errors.ErrAmountMustBePositive;
        }
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const now = Date.now();
            const book = await this.GetBook(ctx, params.book_id);
            const transaction = {
                id: rand_1.default.alphabet(8),
                ref: params.ref,
                ref_id: params.ref_id,
                create_by: params.create_by,
                book_id: params.book_id,
                amount: params.amount,
                type: params.type,
                note: params.note,
                ctime: now,
            };
            await this.dal.CreatTransaction(ctx, transaction);
            if (transaction.ref === "order") {
                const order_id = transaction.ref_id;
                await this.orderBLL.PayOrder(ctx, order_id, {
                    ref_paid: "accounting",
                    ref_paid_id: transaction.id,
                });
                const order = await this.orderBLL.GetOrder(ctx, order_id);
                if (params.amount === order.total) {
                    const total = book.total + params.amount;
                    await this.dal.UpdateBookTotal(ctx, book.id, total);
                }
                else {
                    throw accounting_1.AccountingNS.Errors.ErrOrderPriceAndTransactionAmount;
                }
            }
            else if (transaction.ref === "retail") {
                const order_id = transaction.ref_id;
                await this.retailBLL.PayOrder(ctx, order_id, {
                    ref_paid: "accounting",
                    ref_paid_id: transaction.id,
                });
                const order = await this.retailBLL.GetOrder(ctx, order_id);
                if (params.amount === order.total) {
                    const total = book.total + params.amount;
                    await this.dal.UpdateBookTotal(ctx, book.id, total);
                }
                else {
                    throw accounting_1.AccountingNS.Errors.ErrOrderPriceAndTransactionAmount;
                }
            }
            else {
                throw accounting_1.AccountingNS.Errors.ErrTransactionRefNotAllowed;
            }
            return transaction;
        });
    }
    async ViewTransaction(ctx, id) {
        const transaction = await this.dal.GetTransaction(id);
        const order = await this.orderBLL.GetOrder(ctx, transaction.ref_id);
        const res = {
            ...transaction,
            order,
        };
        return res;
    }
}
exports.AccountingBLLBase = AccountingBLLBase;
//# sourceMappingURL=accounting.bll.base.js.map