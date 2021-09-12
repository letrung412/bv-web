"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBLLBase = void 0;
const mongodb_1 = require("../lib/mongodb");
class ContextBLLBase {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
    }
    async RunTransaction(ctx, fn) {
        if (mongodb_1.MongoCommon.Session(ctx)) {
            return fn(ctx);
        }
        const session = this.mongoClient.startSession();
        const tx = mongodb_1.MongoCommon.WithSession(ctx, session);
        let result;
        await session.withTransaction(async () => {
            result = await fn(tx);
            await session.commitTransaction();
        });
        return result;
    }
}
exports.ContextBLLBase = ContextBLLBase;
