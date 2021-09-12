import { ContextNS } from "../ext/ctx";
import { OrderNS } from "../order/order";

export namespace AccountingNS {
    export enum BookStatus {
        Active = "active",
        Inactive = "inactive"
    }

    export interface Book {
        id: string;
        name: string;
        total: number;
        status: BookStatus;
        ctime: number;
        mtime: number;
    }

    export interface CreateBook {
        name?: string;
    }

    export interface UpdateBook {
        name?: string;
        status?: BookStatus;
    }

    export enum TransactionType {
        Cash = "cash",
        Other = "other"
    }
    export interface Transaction {
        id: string;
        ref: "order" | "retail";
        ref_id: string;
        book_id: string;
        create_by: string; //user_id
        amount: number;
        type: TransactionType;
        note: string;
        ctime: number;
    }

    export interface CreateTransaction {
        ref: "order" | "retail";
        ref_id: string;
        book_id: string;
        create_by: string;
        amount: number;
        type: TransactionType;
        note: string;
    }

    export interface ViewTransaction extends Transaction {
        order: OrderNS.Order;
    }

    export interface QueryTransactionParams {
        create_by?: string;
        ctime: Array<number>;
    }

    export interface BLL {
        ListBook(status: BookStatus): Promise<Book[]>;
        GetBook(ctx: ContextNS.Context, id: string): Promise<Book>;
        CreateBook(ctx: ContextNS.Context, params: CreateBook): Promise<Book>;
        UpdateBook(ctx: ContextNS.Context, id: string, params: UpdateBook): Promise<void>;

        ListTransaction(ctx: ContextNS.Context, query: QueryTransactionParams): Promise<ViewTransaction[]>;
        GetTransaction(id: string): Promise<Transaction>;
        CreateTransaction(ctx: ContextNS.Context, params: CreateTransaction): Promise<Transaction>;
        ViewTransaction(ctx: ContextNS.Context, id: string): Promise<ViewTransaction>;
    }

    export interface DAL {
        ListBook(status: BookStatus): Promise<Book[]>;
        GetBook(ctx: ContextNS.Context, id: string): Promise<Book>;
        CreateBook(ctx: ContextNS.Context, book: Book): Promise<void>;
        UpdateBook(ctx: ContextNS.Context, book: Book): Promise<void>;
        UpdateBookTotal(ctx: ContextNS.Context, id: string, total: number): Promise<void>;

        ListTransaction(query: QueryTransactionParams): Promise<Transaction[]>;
        GetTransaction(id: string): Promise<Transaction>;
        CreatTransaction(ctx: ContextNS.Context, transaction: Transaction): Promise<void>;
    }

    export const Errors = {
        ErrBookNotFound: new Error("Book not found"),
        ErrTransactionRefNotAllowed: new Error("transaction ref not allowed"),
        ErrTransactionNotFound: new Error("Transaction not found"),
        ErrAmountMustBePositive: new Error("amount must be a positive number"),
        ErrOrderPriceAndTransactionAmount: new Error("Order price different transaction amount ")
    }
}
