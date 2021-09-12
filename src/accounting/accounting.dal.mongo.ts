import { AccountingNS } from './accounting';
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes, MongoCommon } from "../lib/mongodb";
import { ContextNS } from '../ext/ctx';

export class AccountingDALMongo implements AccountingNS.DAL {
    constructor(
        private db: MongoDB
    ) { }

    async init() {}

    private col_accounting_book = this.db.collection("accounting_book");
    private col_accounting_transaction = this.db.collection("accounting_transaction");

    async ListBook(status: AccountingNS.BookStatus) {
        const docs = await this.col_accounting_book.find({status: status}).toArray();
        return FromMongoData.Many<AccountingNS.Book>(docs); 
    }

    async GetBook(ctx: ContextNS.Context, id: string) {
        const session = MongoCommon.Session(ctx);
        const doc = await this.col_accounting_book.findOne({ _id: id }, { session });
        return FromMongoData.One<AccountingNS.Book>(doc);
    }

    async CreateBook(ctx: ContextNS.Context, book: AccountingNS.Book) {
        const session = MongoCommon.Session(ctx);
        const doc = ToMongoData.One(book);
        await this.col_accounting_book.insertOne(doc, { session });
    }

    async UpdateBook(ctx: ContextNS.Context, book: AccountingNS.Book) {
        const session = MongoCommon.Session(ctx);
        const doc = ToMongoData.One(book);
        await this.col_accounting_book.updateOne({ _id: book.id }, { $set: doc }, { session });
    }

    async ListTransaction(query : AccountingNS.QueryTransactionParams) {
        let filter = {} as any;
        if (query.create_by) {
            filter.create_by = query.create_by;
        }
        if (query.ctime) {
            filter.ctime = {$gte:query.ctime[0] , $lte:query.ctime[1]};
        }
        // const user_id = query.create_by;
        const docs = await this.col_accounting_transaction.find(filter).toArray();
        return FromMongoData.Many<AccountingNS.Transaction>(docs);
    }

    async GetTransaction(id: string) {
        const doc = await this.col_accounting_transaction.findOne({ _id: id });
        return FromMongoData.One<AccountingNS.Transaction>(doc);
    }

    async CreatTransaction(ctx: ContextNS.Context, transaction: AccountingNS.Transaction) {
        const session = MongoCommon.Session(ctx);
        const doc = ToMongoData.One(transaction);
        await this.col_accounting_transaction.insertOne(doc, { session });
    }

    async UpdateBookTotal(ctx: ContextNS.Context, id: string, total: number) {
        const session = MongoCommon.Session(ctx);
        await this.col_accounting_book.updateOne({ _id: id }, { $set: { total } }, { session });
    }
}