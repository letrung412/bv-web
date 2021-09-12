import { ContextNS } from "../ext/ctx";
import { CustomerNS } from "../customer/customer";
import { ServiceNS } from "../service/service";
import { ProductNS } from "../product/product";
import rand from "../lib/rand";
import { format } from "date-fns";

export namespace OrderNS {
  export enum Status {
    New = "new",
    Paid = "paid",
    Done = "done"
  }

  export enum Type {
    OTCDrug = "otc_drug", // thuốc bổ sung bán tại quầy
    ETCDrug = "etc_drug", // thuốc theo toa
    Other = "other",
  }

  export interface Order {
    id: string;
    status: Status;
    customer_id: string;//
    code: string;
    type: Type;
    ref: "job_step";
    ref_id: string;
    total: number;
    ref_paid?: "accounting"; // accounting transaction
    ref_paid_id?: string;
    ref_paid_at?: number;
    ref_done?: "job_step" | "warehouse"; // job step, warehouse transaction
    ref_done_id?: string;
    ref_done_at?: number;
    ctime: number;
    mtime: number;
  }

  export interface Item {
    id: string;
    order_id: string;
    ref_id: string,
    ref: "service" | "product";
    price: number;
    origin_price: number;
    quantity: number;
    discount?: number;
    variant?: ItemVariant;
    attrs?: ProductNS.ProductAttrs;
    ctime: number;
    mtime: number;
  }

  export interface CreateOrderParams {
    ref: "job_step";
    ref_id: string;
    code: string;
    type: Type;
    items?: Array<CreateItemParams>;
    customer_id: string;
  }

  export interface CreateRetailParams {
    item : Array<CreateItemParams>;
  }

  interface ItemVariant {
    policy_id: string;
  }

  export interface CreateItemParams {
    ref: "service" | "product";
    ref_id: string;
    quantity: number;
    discount?: number;
    variant?: ItemVariant;
    attrs?: ProductNS.ProductAttrs;
  }

  export interface UpdateItemParams {
    id : string;
    quantity : number;
  }

  export interface QueryOrderParams {
    status?: Status;
  }

  export interface PayOrderParams {
    ref_paid: "accounting";
    ref_paid_id: string;
  }

  export interface FinishOrderParams {
    ref_done: "job_step" | "warehouse";
    ref_done_id: string;
  }

  export interface ViewItem extends Item {
    ref_value: ServiceNS.Service | ProductNS.Product;
  }

  export interface ViewOrder extends Order {
    customer: CustomerNS.Customer;
    items: ViewItem[];
  }

  export interface BLL {
    ListOrder(query: QueryOrderParams): Promise<Order[]>;
    GetOrder(ctx: ContextNS.Context, id: string): Promise<Order>;
    GetOrderByCode(ctx: ContextNS.Context, code: string): Promise<Order>;
    ViewOrder(ctx: ContextNS.Context, id: string): Promise<ViewOrder>;
    CreateOrder(ctx: ContextNS.Context, params: CreateOrderParams): Promise<Order>;
    PayOrder(ctx: ContextNS.Context, id: string, params: PayOrderParams): Promise<Order>;
    FinishOrder(ctx: ContextNS.Context, id: string, params: FinishOrderParams): Promise<Order>;

    AddItem(ctx: ContextNS.Context, order_id: string, params: CreateItemParams): Promise<Item>;
    GetItem(ctx: ContextNS.Context, id: string) : Promise<ViewItem>;
    UpdateItem(tx: ContextNS.Context, params: Array<UpdateItemParams>): Promise<Order[]>;
    DeleteItem(tx: ContextNS.Context, id: string): Promise<Item>;
  }

  export interface DAL {
    ListOrder(query: QueryOrderParams): Promise<Order[]>;
    GetOrder(ctx: ContextNS.Context, id: string): Promise<Order>;
    GetOrderByCode(ctx: ContextNS.Context, code: string): Promise<Order>;
    CreateOrder(ctx: ContextNS.Context, order: Order): Promise<void>;
    UpdateOrder(ctx: ContextNS.Context, order: Order): Promise<void>;

    ListItem(ctx: ContextNS.Context, order_id: string): Promise<Item[]>;
    GetItem(ctx: ContextNS.Context, id: string): Promise<Item>;
    AddItem(ctx: ContextNS.Context, item: Item): Promise<void>;
    UpdateItem(tx: ContextNS.Context, item: Item): Promise<void>;
    DeleteItem(tx: ContextNS.Context, id: string): Promise<void>;
  }

  export const Errors = {
    ErrOrderNotFound: new Error("order not found"),
    ErrOrderRefNotAllowed: new Error("order ref not allowed"),
    ErrOrderDiscountNotAllowed: new Error("order discount not allowed"),
    ErrItemNotFound: new Error("order item not found"),
    ErrQuantityMustBePositive: new Error("quantity must be a positive number"),
    ErrOrderPaidNotEdit: new Error("only order new can update quantity"),
  };

  export const Generator = {
    NewOrderId: () => rand.alphabet(12), // colision 2^36
    NewOrderItemId: () => rand.alphabet(12), // collision 2^36
    NewRetailOrderCode: () => `${format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`
  };
}
