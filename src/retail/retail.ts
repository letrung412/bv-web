import { ContextNS } from "../ext/ctx";
import { ProductNS } from "../product/product";
import rand from "../lib/rand";
import { format } from "date-fns";

export namespace RetailNS {
  export enum Status {
    New = "new",
    Paid = "paid",
    Done = "done"
  }

  export interface Order {
    id: string;
    status: Status;
    code: string;
    total: number;
    ref_paid?: "accounting"; // accounting transaction
    ref_paid_id?: string;
    ref_paid_at?: number;
    ref_done?: "warehouse"; // warehouse transaction
    ref_done_id?: string;
    ref_done_at?: number;
    ctime: number;
    mtime: number;
  }

  export interface Item {
    id: string;
    order_id: string;
    ref: "product";
    ref_id: string,
    price: number;
    origin_price: number;
    quantity: number;
    attrs?: ProductNS.ProductAttrs;
    ctime: number;
    mtime: number;
  }

  export interface ViewOrder extends Order {
    items : ViewItem[];
  }

  export interface CreateOrderParams {
    items?: CreateItemParams[];
  }

  export interface CreateItemParams {
    ref: "product";
    ref_id: string;
    quantity: number;
    attrs?: ProductNS.ProductAttrs;
  }

  export interface QueryOrderParams {
    status?: Status;
  }

  export interface PayOrderParams {
    ref_paid: "accounting";
    ref_paid_id: string;
  }

  export interface FinishOrderParams {
    ref_done: "warehouse";
    ref_done_id: string;
  }

  export interface ViewItem extends Item {
    ref_value: ProductNS.Product;
  }

  export interface BLL {
    // ListOrder(query: QueryOrderParams): Promise<Order[]>;
    GetOrder(ctx: ContextNS.Context, id: string): Promise<ViewOrder>;
    GetOrderByCode(ctx: ContextNS.Context, code: string): Promise<ViewOrder>;
    CreateOrder(ctx: ContextNS.Context, params: CreateOrderParams): Promise<Order>;
    PayOrder(ctx: ContextNS.Context, id: string, params: PayOrderParams): Promise<Order>;
    FinishOrder(ctx: ContextNS.Context, id: string, params: FinishOrderParams): Promise<Order>;

    ListItem(ctx: ContextNS.Context, order_id: string): Promise<Item[]>;
  }

  export interface DAL {
    // ListOrder(query: QueryOrderParams): Promise<Order[]>;
    GetOrder(ctx: ContextNS.Context, id: string): Promise<Order>;
    GetOrderByCode(ctx: ContextNS.Context, code: string): Promise<Order>;
    CreateOrder(ctx: ContextNS.Context, order: Order): Promise<void>;
    UpdateOrder(ctx: ContextNS.Context, order: Order): Promise<void>;

    ListItem(ctx: ContextNS.Context, order_id: string): Promise<Item[]>;
    AddItem(ctx: ContextNS.Context, item: Item): Promise<void>;
  }

  export const Errors = {
    ErrOrderNotFound: new Error("order not found"),
    ErrOrderRefNotAllowed: new Error("order ref not allowed"),
    ErrItemNotFound: new Error("order item not found"),
  };

  export const Generator = {
    NewOrderId: () => rand.alphabet(12), // colision 2^36
    NewOrderItemId: () => rand.alphabet(12), // collision 2^36
    NewOrderCode: () => `${format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`
  };
}
