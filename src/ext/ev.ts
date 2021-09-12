import { ContextNS } from "./ctx";

export namespace EventNS {
  export const enum Type {
    OrderPaid = "order_paid",
    OrderDone = "order_done",
  }

  export type PayloadMap = {
    [Type.OrderPaid]: {
      order_id: string;
    },
    [Type.OrderDone]: {
      order_id: string;
    },
  }

  export type Handler<T extends Type> = (ctx: ContextNS.Context, payload: PayloadMap[T]) => Promise<void>;

  export interface BLL {
    Emit<T extends Type>(ctx: ContextNS.Context, event_type: T, payload: PayloadMap[T]);
    On<T extends Type>(name: T, cb: Handler<T>);
  }
}
