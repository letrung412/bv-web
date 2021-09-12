import { ContextNS } from "../ext/ctx";
import { EventNS } from "../ext/ev";
import { ProductNS } from "../product/product";
import { RetailNS } from "./retail";

export class RetailBLLBase implements RetailNS.BLL {
  constructor(
    private dal: RetailNS.DAL,
    private contextBLL: ContextNS.BLL,
    private eventBLL: EventNS.BLL,
    private productBLL: ProductNS.BLL,
  ) { }

  async init() { }
  
  async ListItem(ctx: ContextNS.Context, order_id: string) {
    const items = await this.dal.ListItem(ctx, order_id);
    return items;
  }
  
  async GetOrder(ctx: ContextNS.Context, id: string) {
    const order = await this.dal.GetOrder(ctx, id);
    if (!order) {
      throw RetailNS.Errors.ErrOrderNotFound;
    }
    const items = await this.ListItem(ctx, order.id);
    const view_items = await Promise.all(items.map(async item => {
      const view_item: RetailNS.ViewItem = { ...item, ref_value: null };
      view_item.ref_value = await this.productBLL.GetProduct(item.ref_id);
      return view_item;
    }));
    const view_order = {
      ...order,
      items : view_items
    }
    return view_order;
  } 

  async GetOrderByCode(ctx: ContextNS.Context, code: string) {
    const order = await this.dal.GetOrderByCode(ctx, code);
    if (!order) {
      throw RetailNS.Errors.ErrOrderNotFound;
    }
    const items = await this.ListItem(ctx, order.id);
    const view_items = await Promise.all(items.map(async item => {
      const view_item: RetailNS.ViewItem = { ...item, ref_value: null };
      view_item.ref_value = await this.productBLL.GetProduct(item.ref_id);
      return view_item;
    }));
    const view_order = {
      ...order,
      items : view_items
    }
    return view_order;
  }

  async CreateOrder(ctx: ContextNS.Context, params: RetailNS.CreateOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const now = Date.now();
      const order_id = RetailNS.Generator.NewOrderId();
      let total = 0;
      if (Array.isArray(params.items)) {
        for (const item_params of params.items) {
          const item = await this.unsafeAddItem(ctx, order_id, item_params);
          total += item.price * item.quantity;
        }
      }
      const unsafe_order: RetailNS.Order = {
        id: order_id,
        status: RetailNS.Status.New,
        code: RetailNS.Generator.NewOrderCode(),
        total,
        ctime: now,
        mtime: now,
      };
      await this.dal.CreateOrder(ctx, unsafe_order);
      const order = await this.recomputeOrder(ctx, unsafe_order.id);
      return order;
    });
  }

  private async recomputeOrder(ctx: ContextNS.Context, order_id: string) {
    const order = await this.GetOrder(ctx, order_id);
    const items = await this.ListItem(ctx, order_id);
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    order.total = total;
    await this.dal.UpdateOrder(ctx, order);
    return order;
  }

  async unsafeAddItem(ctx: ContextNS.Context, order_id: string, params: RetailNS.CreateItemParams) {
    const now = Date.now();
    let price = 0; 
    let origin_price = 0;
    if (params.ref == "product") {
      const product_id = params.ref_id;
      const product = await this.productBLL.GetProduct(product_id);
      price = product.price;
      origin_price = product.origin_price;
    } else {
      throw RetailNS.Errors.ErrOrderRefNotAllowed;
    }
    const quantity = params.quantity || 1;
    const item: RetailNS.Item = {
      id: RetailNS.Generator.NewOrderItemId(),
      order_id,
      ref_id: params.ref_id,
      ref: params.ref,
      price,
      origin_price,
      attrs: params.attrs,
      quantity,
      ctime: now,
      mtime: now,
    };
    await this.dal.AddItem(ctx, item);
    return item;
  }
  
  async AddItem(ctx: ContextNS.Context, order_id: string, params: RetailNS.CreateItemParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const item = await this.unsafeAddItem(ctx, order_id, params);
      await this.recomputeOrder(ctx, order_id);
      return item;
    });
  }

  async PayOrder(ctx: ContextNS.Context, id: string, params: RetailNS.PayOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const order = await this.GetOrder(ctx, id);
      order.ref_paid = params.ref_paid;
      order.ref_paid_id = params.ref_paid_id;
      const now = Date.now();
      order.ref_paid_at = now;
      order.status = RetailNS.Status.Paid;
      order.mtime = now;
      await this.dal.UpdateOrder(ctx, order);
      return order;
    })
  }

  async FinishOrder(ctx: ContextNS.Context, id: string, params: RetailNS.FinishOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const order = await this.GetOrder(ctx, id);
      order.ref_done = params.ref_done;
      order.ref_done_id = params.ref_done_id;
      const now = Date.now();
      order.ref_done_at = now;
      order.status = RetailNS.Status.Done;
      order.mtime = now;
      await this.dal.UpdateOrder(ctx, order);
      return order;
    })
  }
}
