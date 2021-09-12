import * as express from "express";
import { HttpError, HttpStatusCodes, HttpParamValidators } from "../lib/http";
import { RetailNS } from "./retail";
import { ContextNS } from "../ext/ctx";

export function NewOrderRetailAPI(
  retailBLL : RetailNS.BLL
) {
  const app = express();

  app.post("/create" , async (req,res) => {
    const ctx = ContextNS.New();
    const items = req.body.items;
    const params : RetailNS.CreateOrderParams = {
      items : items
    }
    const docs = await retailBLL.CreateOrder(ctx, params);
    res.json(docs);
  })

  app.get("/get", async (req,res) => {
    const ctx = ContextNS.New();
    if (req.query.id) {
      const id = req.query.id as string;
      const order = await retailBLL.GetOrder(ctx, id);
      return res.json(order);
    }
    if (req.query.code) {
      const code = req.query.code as string;
      const order = await retailBLL.GetOrderByCode(ctx, code);
      return res.json(order);
    }
  })
  return app;
}
