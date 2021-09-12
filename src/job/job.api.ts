import * as express from "express";
import { HttpError, HttpStatusCodes, HttpParamValidators } from "../lib/http";
import { JobNS } from "./job";
import { NewAuthMiddleware, GetAuthData } from "../auth/auth.api.middleware";
import { UserAuthNS } from "../auth/auth";
import { ContextNS } from "../ext/ctx";
import { ServiceNS } from "../service/service";
import { OrderNS } from "../order/order";

export function NewJobAPI(
  userAuthBLL: UserAuthNS.BLL,
  jobBLL: JobNS.BLL,
  serviceBLL: ServiceNS.BLL,
) {
  const app = express();
  const step_types = Object.values(JobNS.StepType);
  app.use(NewAuthMiddleware(userAuthBLL));
  app.post("/job/customer/service", async (req, res) => {
    const customer_id = HttpParamValidators.MustBeString(req.body,"customer_id",2);
    const location_id = HttpParamValidators.MustBeString(req.body,"location_id", 2);
    const service_id = HttpParamValidators.MustBeString(req.body,"service_id", 2);
    const service_policy_id = HttpParamValidators.MustBeString(req.body,"service_policy_id",2);
    let discount = 0;
    let args = {} as any;
    if (service_policy_id) {
      const policy = await serviceBLL.GetPolicy(service_policy_id);
      discount = policy.discount;
      args.service_policy_id = service_policy_id;
    }
    const created_by = GetAuthData(req).user_id;
    const params: JobNS.CreateJobParams = {
      ref: "customer",
      ref_id: customer_id,
      created_by : created_by,
      steps: [
        { 
          created_by,
          location_id,
          type: JobNS.StepType.Exam,
          order_type: OrderNS.Type.Other,
          items: [{
            ref: 'service',
            ref_id: service_id,
            discount,
            variant: {
              policy_id: service_policy_id
            },
            quantity: 1
          }],
        },
      ],
      args,
    };
    const ctx = ContextNS.New();
    const job = await jobBLL.CreateJob(ctx, params);
    const view_job = await jobBLL.ViewJob(ctx, job.id);
    res.json(view_job);
  });

  app.post("/job/customer/test" , async (req,res) => {
    const customer_id = HttpParamValidators.MustBeString(req.body,"customer_id",2);
    const location_id = HttpParamValidators.MustBeString(req.body,"location_id", 2);
    const services = req.body.services;
    const service_policy_id = HttpParamValidators.MustBeString(req.body,"service_policy_id",2);
    let discount = 0;
    let args = {} as any;
    if (service_policy_id) {
      const policy = await serviceBLL.GetPolicy(service_policy_id);
      discount = policy.discount;
      args.service_policy_id = service_policy_id;
    }
    const created_by = GetAuthData(req).user_id;
    const items = services.map(service => {
      return {
          ref: 'service',
          ref_id: service.id,
          discount,
          variant: {
            policy_id: service_policy_id
          },
          quantity: 1
        }
    })
    const params: JobNS.CreateJobParams = {
      ref: "customer",
      ref_id: customer_id,
      created_by : created_by,
      steps: [
        { 
          created_by,
          location_id,
          type: JobNS.StepType.Test,
          order_type: OrderNS.Type.Other,
          items : items
        },
      ],
      args,
    };
    const ctx = ContextNS.New();
    const job = await jobBLL.CreateJob(ctx, params);
    const view_job = await jobBLL.ViewJob(ctx, job.id);
    res.json(view_job);
  })

  app.post("/job/state", async (req, res) => {
    const id = HttpParamValidators.MustBeString(req.body, "id", 2);
    const modified_by = GetAuthData(req).user_id;
    const { state } = req.body;
    if (!state) {
      return res.json(0);
    }
    const params : JobNS.SetJobStateParams = {
      state,
      modified_by,
    }
    const ctx = ContextNS.New();
    await jobBLL.SetJobState(ctx, id, params);
    res.json(1);
  });
  const order_types = Object.values(OrderNS.Type);
  app.post("/step/add", async (req, res) => {
    const job_id = HttpParamValidators.MustBeString(req.body, "job_id", 2);
    const location_id = req.body.location_id;
    const type = HttpParamValidators.MustBeOneOf(req.body, "type", step_types);
    const order_type = req.body.order_type;
    if (order_type) {
      HttpParamValidators.MustBeOneOf(req.body, "order_type", order_types);
    }
    const items = req.body.items;
    const created_by = GetAuthData(req).user_id;
    const params: JobNS.AddStepParams = {
      job_id,
      created_by,
      location_id,
      order_type,
      items,
      type,
    };
    const ctx = ContextNS.New();
    const step = await jobBLL.AddStep(ctx, job_id, params);
    res.json(step);
  });
  const step_statuses = Object.values(JobNS.StepStatus);
  app.post("/step/update", async (req, res) => {
    const id = HttpParamValidators.MustBeString(req.body, "id", 2);
    const modified_by = GetAuthData(req).user_id;
    const status = HttpParamValidators.MustBeOneOf(req.body,"status",step_statuses);
    const results = req.body.results;
    const params: JobNS.UpdateStepParams = {
      status,
      modified_by,
      results
    };
    const ctx = ContextNS.New();
    await jobBLL.UpdateStep(ctx, id, params);
    res.json(1);
  });

  app.post("/step/finish", async (req, res) => {
    const id = HttpParamValidators.MustBeString(req.body, "id", 2);
    const modified_by = GetAuthData(req).user_id;
    const results = req.body.results;
    if (Array.isArray(results)) {
      const params: JobNS.FinishStepParams = {
        modified_by,
        results: req.body.results,
      };
      const ctx = ContextNS.New();
      await jobBLL.FinishStep(ctx, id, params);
      return res.json(1);
    }
    return res.status(400).json("Error : Results not is array");
  });

  app.get("/step/list", async (req, res) => {
    const params: JobNS.QueryStepParams = {};
    if (req.query.location_id) {
      params.location_id = HttpParamValidators.MustBeString(req.query, "location_id", 2);
    }
    if (req.query.status) {
      params.status = (req.query.status as string).split(',') as JobNS.StepStatus[];
    }
    if (req.query.type) {
      params.type = (req.query.type as string).split(',') as JobNS.StepType[];
    }
    if (req.query.customer_code) {
      params.customer_code = HttpParamValidators.MustBeString(req.query, "customer_code" , 8);
    }
    const ctx = ContextNS.New();
    const view_steps = await jobBLL.ViewListStep(ctx, params);
    res.json(view_steps);
  });

  app.get("/step/get", async (req,res) => {
    const id = req.query.id as string;
    const ctx = ContextNS.New();
    const doc = await jobBLL.GetStep(ctx,id);
    res.json(doc);
  })

  app.get("/job/get", async (req, res) => {
    const ctx = ContextNS.New();
    const doc = await jobBLL.ViewJob(ctx, req.query.id as string);
    res.json(doc);
  });

  app.get("/job/list", async (req, res) => {
    const query: JobNS.QueryJobParams = {};
    const stepquery: JobNS.QueryStepParams = {}
    if (req.query.customer_id) {
      query.ref_id = (req.query.customer_id as string).split(',');
    }
    if (req.query.date) {
      query.date = req.query.date as string;
    }
    if (req.query.type) {
      const ctx = ContextNS.New();
      const docs = [];
      stepquery.type = (req.query.type as string).split(',') as JobNS.StepType[];
      (await jobBLL.ListJob(ctx, query)).map(job => {
          job.steps.map(step => {
            stepquery.type.forEach(query => {
              if (step.type == query) {
                docs.push(step);
              }
            })
          })
      })   
      return res.json(docs);
    }
    const ctx = ContextNS.New();
    const docs = await jobBLL.ListJob(ctx, query);
    res.json(docs);
  });
  return app;
}
