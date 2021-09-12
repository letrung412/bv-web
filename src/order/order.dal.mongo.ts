import { FromMongoData, MongoDB,ToMongoData, MongoCommon } from "../lib/mongodb";
import { OrderNS } from "./order";
import { ContextNS } from "../ext/ctx";

export class OrderDALMongo implements OrderNS.DAL {
  constructor(private db: MongoDB) { }

  async init() {
    this.col_order.createIndex('code', { unique: true });
    this.col_item.createIndex('order_id');
  }

  private col_order = this.db.collection("order");
  private col_item = this.db.collection("order_item");

  async ListOrder(query: OrderNS.QueryOrderParams) {
    const filter = {} as any;
    if (query.status) {
      filter.status = query.status;
    }
    const docs = await this.col_order.find(filter).toArray();
    return FromMongoData.Many<OrderNS.Order>(docs);
  }

  async ListItem(ctx: ContextNS.Context, order_id: string) {
    const session = MongoCommon.Session(ctx);
    const docs = await this.col_item.find({ order_id: order_id }, { session }).toArray();
    return FromMongoData.Many<OrderNS.Item>(docs);
  }

  async GetOrder(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_order.findOne({ _id: id }, { session });
    return FromMongoData.One<OrderNS.Order>(doc);
  }

  async GetOrderByCode(ctx: ContextNS.Context, code: string) {
    const session = MongoCommon.Session(ctx);
    const doc = await this.col_order.findOne({ code }, { session });
    return FromMongoData.One<OrderNS.Order>(doc);
  }

  async GetItem(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx)
    const doc = await this.col_item.findOne({ _id: id }, {session});
    if (!doc) {
      throw OrderNS.Errors.ErrItemNotFound
    }
    return FromMongoData.One<OrderNS.Item>(doc);
  }

  async CreateOrder(ctx: ContextNS.Context, order: OrderNS.Order) {
    const doc = ToMongoData.One(order);
    const session = MongoCommon.Session(ctx);
    await this.col_order.insertOne(doc, { session });
  }

  async AddItem(ctx: ContextNS.Context, item: OrderNS.Item) {
    const doc = ToMongoData.One(item);
    const session = MongoCommon.Session(ctx);
    await this.col_item.insertOne(doc, { session });
  }

  async UpdateItem(ctx: ContextNS.Context, item: OrderNS.Item) {
    const session = MongoCommon.Session(ctx);
    const doc = ToMongoData.One(item);
    await this.col_item.updateOne({ _id: item.id }, { $set: doc }, { session });
  }

  async DeleteItem(ctx: ContextNS.Context, id: string) {
    const session = MongoCommon.Session(ctx);
    await this.col_item.deleteOne({ _id: id }, { session });
  }

  async UpdateOrder(ctx: ContextNS.Context, order: OrderNS.Order) {
    const session = MongoCommon.Session(ctx);
    const doc = ToMongoData.One(order);
    await this.col_order.updateOne({ _id: order.id }, { $set: doc }, { session });
  }
}
