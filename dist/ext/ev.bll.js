"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBLLBase = void 0;
const mongodb_1 = require("../lib/mongodb");
const ctx_1 = require("./ctx");
const rand_1 = require("../lib/rand");
class EventBLLBase {
    constructor(db, contextBLL) {
        this.db = db;
        this.contextBLL = contextBLL;
        this.col_ev_one = this.db.collection('ev_one');
        this.col_ev_one_fail = this.db.collection('ev_one_fail');
        this.callbacks = new Map();
    }
    async init() {
        this.col_ev_one.createIndex('expire_at', { sparse: true });
        setTimeout(() => this.scheduleScan(), 3000);
    }
    async scheduleScan() {
        const keys = [...this.callbacks.keys()];
        // console.log('scan', keys);
        const count = await this.scan(keys);
        const next_scan = count > 0 ? 100 : 3000;
        setTimeout(() => this.scheduleScan(), next_scan);
    }
    Emit(ctx, event_type, payload) {
        const session = mongodb_1.MongoCommon.Session(ctx);
        const doc = {
            _id: rand_1.default.alphabet(16),
            name: event_type,
            payload
        };
        this.col_ev_one.insertOne(doc, { session });
    }
    shouldRetry(doc) {
        return doc.attempt < 3;
    }
    async scan(keys) {
        const hold = 30000; // 30 seconds
        const now = Date.now();
        const { ok, value } = await this.col_ev_one.findOneAndUpdate({
            name: { $in: keys },
            $or: [
                { expire_at: { $lte: now } },
                { expire_at: { $exists: false } },
            ]
        }, {
            $set: {
                expire_at: now + hold,
            },
            $inc: {
                attempt: 1
            }
        });
        if (!ok) {
            return 0;
        }
        if (!value) {
            return 0;
        }
        console.log(`event bus get`, value);
        const ctx = ctx_1.ContextNS.New();
        return this.contextBLL.RunTransaction(ctx, async (tx) => {
            const session = mongodb_1.MongoCommon.Session(ctx);
            try {
                await this.handleEvent(ctx, value);
                await this.col_ev_one.deleteOne({ _id: value._id }, { session });
            }
            catch (err) {
                console.log(err);
                if (!this.shouldRetry(value)) {
                    await this.col_ev_one.deleteOne({ _id: value._id }, { session });
                    await this.col_ev_one_fail.insertOne(value, { session });
                    console.log(`move ${value._id} to ev_one_fail`);
                }
            }
            return 1;
        });
    }
    async handleEvent(ctx, doc) {
        const cbs = this.callbacks.get(doc.name);
        if (!Array.isArray(cbs)) {
            console.log(`event handler ${doc.name} empty`);
            return;
        }
        for (const cb of cbs) {
            await cb(ctx, doc.payload);
        }
    }
    On(event_type, callback) {
        const cbs = this.callbacks.get(event_type) || [];
        cbs.push(callback);
        this.callbacks.set(event_type, cbs);
    }
}
exports.EventBLLBase = EventBLLBase;
//# sourceMappingURL=ev.bll.js.map