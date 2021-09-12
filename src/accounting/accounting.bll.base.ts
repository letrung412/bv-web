import { AccountingNS } from './accounting';
import { ContextNS } from '../ext/ctx';
import { EventNS } from '../ext/ev';
import { OrderNS } from '../order/order';
import { RetailNS } from '../retail/retail';
import { OrgNS } from '../org/org';
import rand from "../lib/rand";

export class AccountingBLLBase implements AccountingNS.BLL {
    constructor(
        private dal: AccountingNS.DAL,
        private contextBLL: ContextNS.BLL,
        private orderBLL: OrderNS.BLL,
        private retailBLL: RetailNS.BLL,
        private orgBLL: OrgNS.BLL
    ) { }

    async init() { }

    async ListBook(status: AccountingNS.BookStatus) {
        const book = this.dal.ListBook(status);
        return book;
    }

    async GetBook(ctx: ContextNS.Context, id: string) {
        const book = await this.dal.GetBook(ctx, id);
        if (!book) {
            throw AccountingNS.Errors.ErrBookNotFound;
        }
        return book;
    }


    async CreateBook(ctx: ContextNS.Context, params: AccountingNS.CreateBook) {
        const now = Date.now();
        const status = AccountingNS.BookStatus.Inactive;
        const book: AccountingNS.Book = {
            id: rand.uppercase(8),
            name: params.name,
            status: status,
            total: 0,
            ctime: now,
            mtime: now,
        }
        await this.dal.CreateBook(ctx, book);
        return book;
    }

    async UpdateBook(ctx: ContextNS.Context, id: string, params: AccountingNS.UpdateBook) {
        const book = await this.GetBook(ctx, id);
        book.name = params.name;
        book.status = params.status;
        await this.dal.UpdateBook(ctx, book);
    }

    async ListTransaction(ctx: ContextNS.Context, query: AccountingNS.QueryTransactionParams) {
        const transactions = await this.dal.ListTransaction(query);
        const view_transactions = await Promise.all(transactions.map(async transaction => {
            let order;
            if (transaction.ref == "order") {
                order = await this.orderBLL.ViewOrder(ctx, transaction.ref_id);
            }
            if (transaction.ref == "retail") {
                order = await this.retailBLL.GetOrder(ctx, transaction.ref_id);
            }
            const view_transaction: AccountingNS.ViewTransaction = {
                ...transaction,
                order
            }
            return view_transaction;
        }))
        return view_transactions;
    }

    async GetTransaction(id: string) {
        const transaction = await this.dal.GetTransaction(id);
        if (!transaction) {
            throw AccountingNS.Errors.ErrBookNotFound;
        }
        return transaction;
    }

    async CreateTransaction(ctx: ContextNS.Context, params: AccountingNS.CreateTransaction) {
        if (params.amount < 0) {
            throw AccountingNS.Errors.ErrAmountMustBePositive;
        }
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const now = Date.now();
            const book = await this.GetBook(ctx, params.book_id);
            const transaction: AccountingNS.Transaction = {
                id: rand.alphabet(8),
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
                    throw AccountingNS.Errors.ErrOrderPriceAndTransactionAmount;
                }
            } else if (transaction.ref === "retail") {
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
                    throw AccountingNS.Errors.ErrOrderPriceAndTransactionAmount;
                }
            } else {
                throw AccountingNS.Errors.ErrTransactionRefNotAllowed;
            }
            return transaction;
        });
    }

    async ViewTransaction(ctx: ContextNS.Context, id: string) {
        const transaction = await this.dal.GetTransaction(id);
        const order = await this.orderBLL.GetOrder(ctx, transaction.ref_id);
        const res: AccountingNS.ViewTransaction = {
            ...transaction,
            order,
        }
        return res;
    }
}