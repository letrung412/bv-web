import { FromMongoData, MongoDB, ToMongoData, MongoCommon } from "../lib/mongodb";
import { ContextNS } from "../ext/ctx";
import { RetailNS } from "./retail";

export class RetailDALMongo implements RetailNS.DAL {
  constructor(private db: MongoDB) { }

  async init() {
    //   this.col_retail.createIndex('code', { unique: true });
    //   this.col_item.createIndex('order_id');
  }

  private col_retail_order = this.db.collection("retail _order");
  private col_retail_item = this.db.collection("retail_order_item");

  async ListItem(ctx: ContextNS.Context, order_id: string) {
    const session = MongoCommon.Session(ctx);
    const docs = await this.col_retail_item.find({ order_id: order_id }, { session }).toArray();
    return FromMongoData.Many<RetailNS.Item>(docs);
  }

  async GetOrder(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_retail_order.findOne({ _id: id }, { session });
    return FromMongoData.One<RetailNS.Order>(doc);
  }

  async GetOrderByCode(ctx: ContextNS.Context, code: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_retail_order.findOne({ code }, { session });
    return FromMongoData.One<RetailNS.Order>(doc);
  }

  async CreateOrder(ctx: ContextNS.Context, order: RetailNS.Order) {
    const doc = ToMongoData.One(order);
    const session = MongoCommon.Session(ctx);
    await this.col_retail_order.insertOne(doc, { session });
  }

  async AddItem(ctx: ContextNS.Context, item: RetailNS.Item) {
    const doc = ToMongoData.One(item);
    const session = MongoCommon.Session(ctx);
    await this.col_retail_item.insertOne(doc, { session });
  }

  async UpdateOrder(ctx: ContextNS.Context, order: RetailNS.Order) {
    const session = MongoCommon.Session(ctx);
    const doc = ToMongoData.One(order);
    await this.col_retail_order.updateOne({ _id: order.id }, { $set: doc }, { session });
  }
}
