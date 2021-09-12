"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobBLLBase = void 0;
const job_1 = require("./job");
const order_1 = require("../order/order");
const date_fns_1 = require("date-fns");
const service_1 = require("../service/service");
const sample_1 = require("../sample/sample");
class JobBLLBase {
    constructor(dal, contextBLL, locationBLL, customerBLL, serviceBLL, orderBLL, uploadBLL) {
        this.dal = dal;
        this.contextBLL = contextBLL;
        this.locationBLL = locationBLL;
        this.customerBLL = customerBLL;
        this.serviceBLL = serviceBLL;
        this.orderBLL = orderBLL;
        this.uploadBLL = uploadBLL;
    }
    async init() { }
    async toViewStep(ctx, step) {
        try {
            const order = await this.orderBLL.ViewOrder(ctx, step.order_id);
            const data_upload = await this.uploadBLL.ListData(step.id);
            const view_step = {
                ...step,
                order,
                upload: data_upload
            };
            if (step.location_id) {
                view_step.location = await this.locationBLL.GetLocation(step.location_id);
            }
            return view_step;
        }
        catch (err) {
            console.log(`read step`, step, err);
            return null;
        }
    }
    async ViewListStep(ctx, query) {
        const steps = await this.dal.ListStep(ctx, query);
        let view_steps = [];
        const start_time = date_fns_1.startOfDay(Date.now()).getTime();
        const end_time = date_fns_1.endOfDay(Date.now()).getTime();
        if (query.customer_code) {
            view_steps = await Promise.all(steps.map(step => this.toViewStep(ctx, step)));
            const steps_by_code = view_steps.filter(step => step.order?.customer.code == query.customer_code &&
                start_time <= step.ctime && step.ctime <= end_time &&
                step.status == job_1.JobNS.StepStatus.New);
            return steps_by_code;
        }
        view_steps = await Promise.all(steps.map(step => this.toViewStep(ctx, step)));
        return view_steps.filter(v => start_time <= v.ctime && v.ctime <= end_time);
    }
    async GetJob(ctx, id) {
        const job = await this.dal.GetJob(ctx, id);
        if (!job) {
            throw job_1.JobNS.Errors.ErrJobNotFound;
        }
        return job;
    }
    async ViewJob(ctx, id) {
        const job = await this.GetJob(ctx, id);
        const steps = await this.dal.ListStep(ctx, { job_id: id });
        const view_steps = await Promise.all(steps.map(step => this.toViewStep(ctx, step)));
        const ref_value = await this.customerBLL.GetCustomer(job.ref_id);
        const res = {
            ...job,
            ref_value,
            steps: view_steps.filter(v => v)
        };
        return res;
    }
    async GetStep(ctx, id) {
        const job_step = await this.dal.GetStep(ctx, id);
        const view_step = await this.toViewStep(ctx, job_step);
        if (!job_step) {
            throw job_1.JobNS.Errors.ErrStepNotFound;
        }
        return view_step;
    }
    async AddStep(ctx, job_id, step) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            if (!step.job_ref_id) {
                const job = await this.GetJob(ctx, job_id);
                step.job_ref_id = job.ref_id;
            }
            const now = Date.now();
            const order_items = step.items;
            const step_code = job_1.JobNS.Generator.NewJobStepCode();
            if (!step.order_type) {
                step.order_type = order_1.OrderNS.Type.Other;
            }
            const order = await this.orderBLL.CreateOrder(ctx, {
                ref: "job_step",
                ref_id: job_1.JobNS.Generator.NewJobStepId(),
                items: order_items,
                code: step_code,
                type: step.order_type,
                customer_id: step.job_ref_id,
            });
            let service;
            if (step.location_id && step.type !== job_1.JobNS.StepType.Buy) {
                // verify location
                await this.locationBLL.GetLocation(step.location_id);
                service = await this.serviceBLL.GetService(order_items[0].ref_id);
            }
            let results = [];
            if (step.type === job_1.JobNS.StepType.Test) {
                if (service.type == service_1.ServiceNS.Type.Test) {
                    for (let i in sample_1.SampleNS.Device) {
                        results.push({ device: sample_1.SampleNS.Device[i] });
                    }
                    await Promise.all(order_items.map(async (item) => {
                        const service = await this.serviceBLL.GetService(item.ref_id);
                        const steps = await this.serviceBLL.ListStep({ service_id: item.ref_id });
                        const customer = await this.customerBLL.GetCustomer(order.customer_id);
                        const now = new Date().getTime();
                        const birthday = new Date(customer.birthday).getTime();
                        const customer_age = date_fns_1.differenceInYears(now, birthday);
                        let obj = {};
                        steps.length == 0
                            ? obj = { device: sample_1.SampleNS.Device.Other, [service.name]: null }
                            : steps.forEach(step => {
                                let new_obj = {};
                                if (step.option?.gender == customer.gender) {
                                    if (step.option.age?.[0] <= customer_age && customer_age <= step.option.age?.[1]) {
                                        new_obj = { device: step.device, [step.name]: { value: "", unit: step.unit, range: step.value } };
                                    }
                                    if (step.option.age == undefined) {
                                        new_obj = { device: step.device, [step.name]: { value: "", unit: step.unit, range: step.value } };
                                    }
                                }
                                if (step.option == null) {
                                    new_obj = { device: step.device, [step.name]: { value: "", unit: step.unit, range: step.value } };
                                }
                                Object.assign(obj, new_obj);
                            });
                        results.forEach(r => {
                            if (r["device"] == obj["device"]) {
                                Object.assign(r, obj);
                            }
                        });
                    }));
                }
            }
            const job_step = {
                id: order.ref_id,
                job_ref_id: step.job_ref_id,
                job_id: job_id,
                code: step_code,
                type: step.type,
                order_id: order.id,
                status: job_1.JobNS.StepStatus.New,
                location_id: step.location_id,
                created_by: step.created_by,
                results: results,
                ctime: now,
                mtime: now,
            };
            await this.dal.CreateStep(ctx, job_step);
            return job_step;
        });
    }
    async CreateJob(ctx, params) {
        if (params.ref === 'customer') {
            await this.customerBLL.GetCustomer(params.ref_id);
        }
        else {
            throw job_1.JobNS.Errors.ErrJobRefNotAllowed;
        }
        return this.contextBLL.RunTransaction(ctx, async (tx) => {
            const now = Date.now();
            const date = date_fns_1.format(now, 'yyyy-MM-dd');
            const count = await this.dal.CountJob(tx, {
                date
            });
            const date_pos = `${count + 1}`;
            const job = {
                id: job_1.JobNS.Generator.NewJobId(),
                date,
                date_pos,
                ref: params.ref,
                ref_id: params.ref_id,
                created_by: params.created_by,
                ctime: now,
                mtime: now,
                args: params.args,
                state: {},
            };
            await this.dal.CreateJob(tx, job);
            for (const step of params.steps) {
                step.job_ref_id = job.ref_id;
                await this.AddStep(tx, job.id, step);
            }
            return job;
        });
    }
    async SetJobState(ctx, id, params) {
        const job = await this.GetJob(ctx, id);
        job.state = Object.assign(job.state || {}, params.state);
        job.modified_by = params.modified_by;
        job.mtime = Date.now();
        await this.dal.UpdateJob(ctx, job);
        return job;
    }
    async FinishStep(ctx, id, params) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const job_step = await this.GetStep(ctx, id);
            if (params.results) {
                job_step.status = job_1.JobNS.StepStatus.Done;
                job_step.results = params.results;
                job_step.modified_by = params.modified_by;
            }
            job_step.mtime = Date.now();
            await this.dal.UpdateStep(ctx, job_step);
            const order_id = job_step.order_id;
            await this.orderBLL.FinishOrder(ctx, order_id, {
                ref_done: "job_step",
                ref_done_id: job_step.id
            });
        });
    }
    async UpdateStep(ctx, id, params) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const job_step = await this.GetStep(ctx, id);
            if (params.status) {
                if (params.status === job_1.JobNS.StepStatus.Cancel && job_step.status !== job_1.JobNS.StepStatus.Ready) {
                    throw job_1.JobNS.Errors.ErrCancelStep;
                }
                job_step.status = params.status;
            }
            if (params.modified_by) {
                job_step.modified_by = params.modified_by;
            }
            if (params.results) {
                job_step.results = params.results;
            }
            job_step.mtime = Date.now();
            await this.dal.UpdateStep(ctx, job_step);
        });
    }
    async ListJob(ctx, query) {
        const docs = await this.dal.ListJob(ctx, query);
        const view_jobs = await Promise.all(docs.map(doc => this.ViewJob(ctx, doc.id)));
        return view_jobs;
    }
}
exports.JobBLLBase = JobBLLBase;
//# sourceMappingURL=job.bll.base.js.map