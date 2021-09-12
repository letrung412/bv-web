"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewJobAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const job_1 = require("./job");
const auth_api_middleware_1 = require("../auth/auth.api.middleware");
const ctx_1 = require("../ext/ctx");
const order_1 = require("../order/order");
function NewJobAPI(userAuthBLL, jobBLL, serviceBLL) {
    const app = express();
    const step_types = Object.values(job_1.JobNS.StepType);
    app.use(auth_api_middleware_1.NewAuthMiddleware(userAuthBLL));
    app.post("/job/customer/service", async (req, res) => {
        const customer_id = http_1.HttpParamValidators.MustBeString(req.body, "customer_id", 2);
        const location_id = http_1.HttpParamValidators.MustBeString(req.body, "location_id", 2);
        const service_id = http_1.HttpParamValidators.MustBeString(req.body, "service_id", 2);
        const service_policy_id = http_1.HttpParamValidators.MustBeString(req.body, "service_policy_id", 2);
        let discount = 0;
        let args = {};
        if (service_policy_id) {
            const policy = await serviceBLL.GetPolicy(service_policy_id);
            discount = policy.discount;
            args.service_policy_id = service_policy_id;
        }
        const created_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const params = {
            ref: "customer",
            ref_id: customer_id,
            created_by: created_by,
            steps: [
                {
                    created_by,
                    location_id,
                    type: job_1.JobNS.StepType.Exam,
                    order_type: order_1.OrderNS.Type.Other,
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
        const ctx = ctx_1.ContextNS.New();
        const job = await jobBLL.CreateJob(ctx, params);
        const view_job = await jobBLL.ViewJob(ctx, job.id);
        res.json(view_job);
    });
    app.post("/job/customer/test", async (req, res) => {
        const customer_id = http_1.HttpParamValidators.MustBeString(req.body, "customer_id", 2);
        const location_id = http_1.HttpParamValidators.MustBeString(req.body, "location_id", 2);
        const services = req.body.services;
        const service_policy_id = http_1.HttpParamValidators.MustBeString(req.body, "service_policy_id", 2);
        let discount = 0;
        let args = {};
        if (service_policy_id) {
            const policy = await serviceBLL.GetPolicy(service_policy_id);
            discount = policy.discount;
            args.service_policy_id = service_policy_id;
        }
        const created_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const items = services.map(service => {
            return {
                ref: 'service',
                ref_id: service.id,
                discount,
                variant: {
                    policy_id: service_policy_id
                },
                quantity: 1
            };
        });
        const params = {
            ref: "customer",
            ref_id: customer_id,
            created_by: created_by,
            steps: [
                {
                    created_by,
                    location_id,
                    type: job_1.JobNS.StepType.Test,
                    order_type: order_1.OrderNS.Type.Other,
                    items: items
                },
            ],
            args,
        };
        const ctx = ctx_1.ContextNS.New();
        const job = await jobBLL.CreateJob(ctx, params);
        const view_job = await jobBLL.ViewJob(ctx, job.id);
        res.json(view_job);
    });
    app.post("/job/state", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, "id", 2);
        const modified_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const { state } = req.body;
        if (!state) {
            return res.json(0);
        }
        const params = {
            state,
            modified_by,
        };
        const ctx = ctx_1.ContextNS.New();
        await jobBLL.SetJobState(ctx, id, params);
        res.json(1);
    });
    const order_types = Object.values(order_1.OrderNS.Type);
    app.post("/step/add", async (req, res) => {
        const job_id = http_1.HttpParamValidators.MustBeString(req.body, "job_id", 2);
        const location_id = req.body.location_id;
        const type = http_1.HttpParamValidators.MustBeOneOf(req.body, "type", step_types);
        const order_type = req.body.order_type;
        if (order_type) {
            http_1.HttpParamValidators.MustBeOneOf(req.body, "order_type", order_types);
        }
        const items = req.body.items;
        const created_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const params = {
            job_id,
            created_by,
            location_id,
            order_type,
            items,
            type,
        };
        const ctx = ctx_1.ContextNS.New();
        const step = await jobBLL.AddStep(ctx, job_id, params);
        res.json(step);
    });
    const step_statuses = Object.values(job_1.JobNS.StepStatus);
    app.post("/step/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, "id", 2);
        const modified_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const status = http_1.HttpParamValidators.MustBeOneOf(req.body, "status", step_statuses);
        const results = req.body.results;
        const params = {
            status,
            modified_by,
            results
        };
        const ctx = ctx_1.ContextNS.New();
        await jobBLL.UpdateStep(ctx, id, params);
        res.json(1);
    });
    app.post("/step/finish", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.body, "id", 2);
        const modified_by = auth_api_middleware_1.GetAuthData(req).user_id;
        const results = req.body.results;
        if (Array.isArray(results)) {
            const params = {
                modified_by,
                results: req.body.results,
            };
            const ctx = ctx_1.ContextNS.New();
            await jobBLL.FinishStep(ctx, id, params);
            return res.json(1);
        }
        return res.status(400).json("Error : Results not is array");
    });
    app.get("/step/list", async (req, res) => {
        const params = {};
        if (req.query.location_id) {
            params.location_id = http_1.HttpParamValidators.MustBeString(req.query, "location_id", 2);
        }
        if (req.query.status) {
            params.status = req.query.status.split(',');
        }
        if (req.query.type) {
            params.type = req.query.type.split(',');
        }
        if (req.query.customer_code) {
            params.customer_code = http_1.HttpParamValidators.MustBeString(req.query, "customer_code", 8);
        }
        const ctx = ctx_1.ContextNS.New();
        const view_steps = await jobBLL.ViewListStep(ctx, params);
        res.json(view_steps);
    });
    app.get("/step/get", async (req, res) => {
        const id = req.query.id;
        const ctx = ctx_1.ContextNS.New();
        const doc = await jobBLL.GetStep(ctx, id);
        res.json(doc);
    });
    app.get("/job/get", async (req, res) => {
        const ctx = ctx_1.ContextNS.New();
        const doc = await jobBLL.ViewJob(ctx, req.query.id);
        res.json(doc);
    });
    app.get("/job/list", async (req, res) => {
        const query = {};
        const stepquery = {};
        if (req.query.customer_id) {
            query.ref_id = req.query.customer_id.split(',');
        }
        if (req.query.date) {
            query.date = req.query.date;
        }
        if (req.query.type) {
            const ctx = ctx_1.ContextNS.New();
            const docs = [];
            stepquery.type = req.query.type.split(',');
            (await jobBLL.ListJob(ctx, query)).map(job => {
                job.steps.map(step => {
                    stepquery.type.forEach(query => {
                        if (step.type == query) {
                            docs.push(step);
                        }
                    });
                });
            });
            return res.json(docs);
        }
        const ctx = ctx_1.ContextNS.New();
        const docs = await jobBLL.ListJob(ctx, query);
        res.json(docs);
    });
    return app;
}
exports.NewJobAPI = NewJobAPI;
