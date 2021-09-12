import { OrderNS } from "./order";
import { ContextNS } from "../ext/ctx";
import { EventNS } from "../ext/ev";
import { ServiceNS } from "../service/service";
import { CustomerNS } from "../customer/customer";
import { ProductNS } from "../product/product";

export class OrderBLLBase implements OrderNS.BLL {
  constructor(
    private dal: OrderNS.DAL,
    private contextBLL: ContextNS.BLL,
    private eventBLL: EventNS.BLL,
    private serviceBLL: ServiceNS.BLL,
    private customerBLL: CustomerNS.BLL,
    private productBLL: ProductNS.BLL,
  ) { }

  async init() { }

  async ListOrder(query: OrderNS.QueryOrderParams) {
    return this.dal.ListOrder(query);
  }

  async ListItem(ctx: ContextNS.Context, order_id: string) {
    const items = await this.dal.ListItem(ctx, order_id);
    return items;
  }

  async GetOrder(ctx: ContextNS.Context, id: string) {
    const order = await this.dal.GetOrder(ctx, id);
    if (!order) {
      throw OrderNS.Errors.ErrOrderNotFound;
    }
    return order;
  }

  async GetOrderByCode(ctx: ContextNS.Context, code: string) {
    const order = await this.dal.GetOrderByCode(ctx, code);
    if (!order) {
      throw OrderNS.Errors.ErrOrderNotFound;
    }
    return order;
  }

  async ViewOrder(ctx: ContextNS.Context, id: string) {
    const order = await this.GetOrder(ctx, id);
    const customer = await this.customerBLL.ViewCustomer(order.customer_id);
    const items = await this.ListItem(ctx, order.id);
    const view_items = await Promise.all(items.map(async item => {
      const view_item: OrderNS.ViewItem = { ...item, ref_value: null };
      if (item.ref === 'product') {
        view_item.ref_value = await this.productBLL.GetProduct(item.ref_id);
      } else if (item.ref === 'service') {
        view_item.ref_value = await this.serviceBLL.GetService(item.ref_id);
        const steps = await this.serviceBLL.ListStep({service_id : item.ref_id});
        view_item.ref_value["steps"] = steps;
      }
      return view_item;
    }));
    const res: OrderNS.ViewOrder = {
      ...order,
      customer,
      items: view_items,
    };
    return res;
  }

  async CreateOrder(ctx: ContextNS.Context, params: OrderNS.CreateOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const now = Date.now();
      const order_id = OrderNS.Generator.NewOrderId();
      let total = 0;
      if (Array.isArray(params.items)) {
        for (const item_params of params.items) {
          const item = await this.unsafeAddItem(ctx, order_id, item_params);
          total += item.price * item.quantity;
        }
      }
      const unsafe_order: OrderNS.Order = {
        id: order_id,
        status: OrderNS.Status.New,
        customer_id: params.customer_id,
        code: params.code,
        type: params.type,
        ref: params.ref,
        ref_id: params.ref_id,
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

  async unsafeAddItem(ctx: ContextNS.Context, order_id: string, params: OrderNS.CreateItemParams) {
    const now = Date.now();
    let origin_price = 0;
    let discount = +params.discount || 0;
    if (params.ref == "service") {
      const service_id = params.ref_id;
      const service = await this.serviceBLL.GetService(service_id);
      origin_price = service.origin_price;
      discount = 1 - (service.price / service.origin_price)
    } else if (params.ref == "product") {
      const product_id = params.ref_id;
      const product = await this.productBLL.GetProduct(product_id);
      origin_price = product.price;
    } else {
      throw OrderNS.Errors.ErrOrderRefNotAllowed;
    }
    const quantity = params.quantity || 1;
    if (discount < 0 || discount > 1) {
      throw OrderNS.Errors.ErrOrderDiscountNotAllowed;
    }
    const price = origin_price * (1 - discount);
    const item: OrderNS.Item = {
      id: OrderNS.Generator.NewOrderItemId(),
      order_id,
      ref_id: params.ref_id,
      ref: params.ref,
      origin_price,
      price,
      discount: discount,
      variant: params.variant,
      attrs: params.attrs,
      quantity,
      ctime: now,
      mtime: now,
    };
    await this.dal.AddItem(ctx, item);
    return item;
  }
  
  async AddItem(ctx: ContextNS.Context, order_id: string, params: OrderNS.CreateItemParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const item = await this.unsafeAddItem(ctx, order_id, params);
      await this.recomputeOrder(ctx, order_id);
      return item;
    });
  }
  
  async UpdateItem(ctx: ContextNS.Context, params: Array<OrderNS.UpdateItemParams>) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      return await Promise.all(params.map(async param => {
        if (param.quantity >= 0) {
          let item = await this.dal.GetItem(ctx, param.id);
          let order = await this.ViewOrder(ctx, item.order_id);
          if (order.status === OrderNS.Status.New) {
            item.quantity = param.quantity;
            item.mtime = Date.now();
            await this.dal.UpdateItem(ctx, item);
            await this.recomputeOrder(ctx, item.order_id);
            const new_order = await this.ViewOrder(ctx, item.order_id);
            return new_order;
          } else {
            throw OrderNS.Errors.ErrOrderPaidNotEdit
          }
        } else {
            throw OrderNS.Errors.ErrQuantityMustBePositive
        }
      }))
  })}

  async GetItem(ctx: ContextNS.Context, id : string) {
    const doc = await this.dal.GetItem(ctx, id);  
    if (!doc) {
      throw OrderNS.Errors.ErrItemNotFound;
    }
    const ref_value = await this.serviceBLL.GetService(doc.ref_id);
    return {...doc, ref_value};
  }

  async DeleteItem(ctx: ContextNS.Context, id: string) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const item = await this.dal.GetItem(ctx, id);
      await this.dal.DeleteItem(ctx, id);
      await this.recomputeOrder(ctx, item.order_id);
      return item;
    });
  }

  async PayOrder(ctx: ContextNS.Context, id: string, params: OrderNS.PayOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const order = await this.GetOrder(ctx, id);
      order.ref_paid = params.ref_paid;
      order.ref_paid_id = params.ref_paid_id;
      const now = Date.now();
      order.ref_paid_at = now;
      order.status = OrderNS.Status.Paid;
      order.mtime = now;
      await this.dal.UpdateOrder(ctx, order);
      await this.eventBLL.Emit(ctx, EventNS.Type.OrderPaid, {
        order_id: order.id,
      });
      return order;
    })
  }

  async FinishOrder(ctx: ContextNS.Context, id: string, params: OrderNS.FinishOrderParams) {
    return this.contextBLL.RunTransaction(ctx, async (ctx) => {
      const order = await this.GetOrder(ctx, id);
      order.ref_done = params.ref_done;
      order.ref_done_id = params.ref_done_id;
      const now = Date.now();
      order.ref_done_at = now;
      order.status = OrderNS.Status.Done;
      order.mtime = now;
      await this.dal.UpdateOrder(ctx, order);
      await this.eventBLL.Emit(ctx, EventNS.Type.OrderDone, {
        order_id: order.id,
      });
      return order;
    })
  }
}
