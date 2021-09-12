import { EventEmitter } from "events";
import { EventNS } from "./ev";
import { MongoDB, MongoCommon } from "../lib/mongodb";
import { ContextNS } from "./ctx";
import rand from "../lib/rand";

export class EventBLLBase implements EventNS.BLL {
  constructor(
    private db: MongoDB,
    private contextBLL: ContextNS.BLL,
  ) { }

  private col_ev_one = this.db.collection('ev_one');
  private col_ev_one_fail = this.db.collection('ev_one_fail');
  private callbacks = new Map<string, EventNS.Handler<any>[]>();

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

  Emit(
    ctx: ContextNS.Context,
    event_type: string,
    payload: any,
  ) {
    const session = MongoCommon.Session(ctx);
    const doc = {
      _id: rand.alphabet(16),
      name: event_type,
      payload
    };
    this.col_ev_one.insertOne(doc, { session });
  }

  private shouldRetry(doc) {
    return doc.attempt < 3;
  }

  private async scan(keys: string[]) {
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
    const ctx = ContextNS.New();
    return this.contextBLL.RunTransaction(ctx, async (tx) => {
      const session = MongoCommon.Session(ctx);
      try {
        await this.handleEvent(ctx, value);
        await this.col_ev_one.deleteOne({ _id: value._id }, { session });
      } catch (err) {
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

  async handleEvent(ctx: ContextNS.Context, doc: any) {
    const cbs = this.callbacks.get(doc.name);
    if (!Array.isArray(cbs)) {
      console.log(`event handler ${doc.name} empty`);
      return;
    }
    for (const cb of cbs) {
      await cb(ctx, doc.payload);
    }
  }

  On(
    event_type: EventNS.Type,
    callback: EventNS.Handler<any>,
  ) {
    const cbs = this.callbacks.get(event_type) || [];
    cbs.push(callback);
    this.callbacks.set(event_type, cbs);
  }
}
