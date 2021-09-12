import { ContextNS } from "./ctx";
import { MongoClient } from "mongodb";
import { MongoCommon } from '../lib/mongodb';

export class ContextBLLBase implements ContextNS.BLL {
    constructor(
        private mongoClient: MongoClient
    ) { }

    async RunTransaction<T>(ctx: ContextNS.Context, fn: (tx: ContextNS.Context) => Promise<T>) {
        if (MongoCommon.Session(ctx)) {
            return fn(ctx);
        }
        const session = this.mongoClient.startSession();
        const tx = MongoCommon.WithSession(ctx, session);
        let result: T;
        await session.withTransaction(async () => {
            result = await fn(tx);
            await session.commitTransaction();
        });
        return result;
    }
}