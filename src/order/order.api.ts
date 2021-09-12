import * as express from "express";
import { HttpError, HttpStatusCodes, HttpParamValidators } from "../lib/http";
import { OrderNS } from "./order";
import { ContextNS } from "../ext/ctx";
import { UserAuthNS } from "../auth/auth";
import { JobNS } from "../job/job";
import { OrgNS } from "../org/org";

export function NewOrderAPI(
  userAuthBLL: UserAuthNS.BLL,
  orderBLL: OrderNS.BLL,
  jobBLL : JobNS.BLL,
  orgBLL : OrgNS.BLL
) {
  const app = express();
  const order_statuses = Object.values(OrderNS.Status);

  app.get("/order/list", async (req, res) => {
    const status = req.query.status as OrderNS.Status;
    if (status) {
      HttpParamValidators.MustBeOneOf(req.query, "status", order_statuses)
    }
    const query: OrderNS.QueryOrderParams = {
      status
    };
    const docs = await orderBLL.ListOrder(query);
    res.json(docs);
  });

  app.get("/order/get", async (req, res) => {
    let id = req.query.id as string;
    const code = req.query.code as string;
    if (!id && !code) {
      throw new HttpError(`id or code is required`, 400);
    }
    const ctx = ContextNS.New();
    if (!id) {
      const order = await orderBLL.GetOrderByCode(ctx, code);
      id = order.id;
    }
    const order = await orderBLL.GetOrder(ctx, id);
    const job_steps = await jobBLL.GetStep(ctx, order.ref_id);
    const job = await jobBLL.GetJob(ctx, job_steps.job_id);
    const user = await orgBLL.GetUser(job_steps.created_by);
    const view_order = await orderBLL.ViewOrder(ctx, id);
    res.json({job , user, view_order});
  });
  
  app.post("/item/add", async (req, res) => {
    const { order_id, ref_id, quantity } = req.body;
    const ref = HttpParamValidators.MustBeOneOf<"service" | "product">(req.body, "ref", ["service", "product"]);
    const params: OrderNS.CreateItemParams = {
      ref,
      ref_id,
      quantity
    }
    const ctx = ContextNS.New();
    const item = await orderBLL.AddItem(ctx, order_id, params);
    res.json(item);
  })

  app.post("/item/update", async (req, res) => {
    const ctx = ContextNS.New();
    const doc = await orderBLL.UpdateItem(ctx, req.body);
    res.json(doc);
  })

  app.get("/item/get", async (req, res) => {
    const id = req.query.id as string;
    const ctx = ContextNS.New();
    const doc = await orderBLL.GetItem(ctx, id);
    res.json(doc);
  })
  return app;
}
