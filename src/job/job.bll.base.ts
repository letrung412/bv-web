import { JobNS } from "./job";
import { ContextNS } from "../ext/ctx";
import { OrderNS } from "../order/order";
import { CustomerNS } from "../customer/customer";
import { LocationNS } from "../location/location";
import { endOfDay, format, startOfDay, differenceInYears } from "date-fns";
import { UploadNS } from "../upload/upload";
import { ServiceNS } from "../service/service";
import { SampleNS } from "../sample/sample";

export class JobBLLBase implements JobNS.BLL {
    constructor(
        private dal: JobNS.DAL,
        private contextBLL: ContextNS.BLL,
        private locationBLL: LocationNS.BLL,
        private customerBLL: CustomerNS.BLL,
        private serviceBLL: ServiceNS.BLL,
        private orderBLL: OrderNS.BLL,
        private uploadBLL: UploadNS.BLL
    ) { }

    async init() { }

    private async toViewStep(ctx: ContextNS.Context, step: JobNS.Step) {
        try {
            const order = await this.orderBLL.ViewOrder(ctx, step.order_id);
            const data_upload = await this.uploadBLL.ListData(step.id);
            const view_step: JobNS.ViewStep = {
                ...step,
                order,
                upload: data_upload
            };
            if (step.location_id) {
                view_step.location = await this.locationBLL.GetLocation(step.location_id);
            }
            return view_step;
        } catch (err) {
            console.log(`read step`, step, err);
            return null;
        }
    }

    async ViewListStep(ctx: ContextNS.Context, query: JobNS.QueryStepParams) {
        const steps = await this.dal.ListStep(ctx, query);
        let view_steps = [];
        const start_time = startOfDay(Date.now()).getTime();
        const end_time = endOfDay(Date.now()).getTime();
        if (query.customer_code) {
            view_steps = await Promise.all(
                steps.map(step => this.toViewStep(ctx, step))
            );
            const steps_by_code = view_steps.filter
                (step => step.order?.customer.code == query.customer_code &&
                    start_time <= step.ctime && step.ctime <= end_time &&
                    step.status == JobNS.StepStatus.New
                );
            return steps_by_code;
        }
        view_steps = await Promise.all(
            steps.map(step => this.toViewStep(ctx, step))
        );
        return view_steps.filter(v => start_time <= v.ctime && v.ctime <= end_time);
    }

    async GetJob(ctx: ContextNS.Context, id: string) {
        const job = await this.dal.GetJob(ctx, id);
        if (!job) {
            throw JobNS.Errors.ErrJobNotFound;
        }
        return job;
    }

    async ViewJob(ctx: ContextNS.Context, id: string) {
        const job = await this.GetJob(ctx, id);
        const steps = await this.dal.ListStep(ctx, { job_id: id });
        const view_steps = await Promise.all(
            steps.map(step => this.toViewStep(ctx, step))
        );
        const ref_value = await this.customerBLL.GetCustomer(job.ref_id);
        const res: JobNS.ViewJob = {
            ...job,
            ref_value,
            steps: view_steps.filter(v => v)
        };
        return res;
    }

    async GetStep(ctx: ContextNS.Context, id: string) {
        const job_step = await this.dal.GetStep(ctx, id);
        const view_step = await this.toViewStep(ctx, job_step);
        if (!job_step) {
            throw JobNS.Errors.ErrStepNotFound;
        }
        return view_step;
    }

    async AddStep(ctx: ContextNS.Context, job_id: string, step: JobNS.StepOptions) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            if (!step.job_ref_id) {
                const job = await this.GetJob(ctx, job_id);
                step.job_ref_id = job.ref_id;
            }
            const now = Date.now();
            const order_items = step.items;
            const step_code = JobNS.Generator.NewJobStepCode();
            if (!step.order_type) {
                step.order_type = OrderNS.Type.Other;
            }
            const order = await this.orderBLL.CreateOrder(ctx, {
                ref: "job_step",
                ref_id: JobNS.Generator.NewJobStepId(),
                items: order_items,
                code: step_code,
                type: step.order_type,
                customer_id: step.job_ref_id,
            });
            let service: ServiceNS.Service;
            if (step.location_id && step.type !== JobNS.StepType.Buy) {
                // verify location
                await this.locationBLL.GetLocation(step.location_id);
                service = await this.serviceBLL.GetService(order_items[0].ref_id);
            }
            let results = [];
            if (step.type === JobNS.StepType.Test) {
                if (service.type == ServiceNS.Type.Test) {
                    for (let i in SampleNS.Device) {
                        results.push({ device: SampleNS.Device[i] })
                    }
                    await Promise.all(order_items.map(async item => {
                        const service = await this.serviceBLL.GetService(item.ref_id);
                        const steps = await this.serviceBLL.ListStep({service_id : item.ref_id});
                        const customer = await this.customerBLL.GetCustomer(order.customer_id);
                        const now = new Date().getTime();
                        const birthday = new Date(customer.birthday).getTime();
                        const customer_age = differenceInYears(now, birthday);
                        let obj = {};
                        steps.length == 0
                        ? obj = { device : SampleNS.Device.Other, [service.name] : null }
                        : steps.forEach(step => {
                            let new_obj = {};
                            if (step.option?.gender == customer.gender) {
                                if (step.option.age?.[0] <= customer_age && customer_age <= step.option.age?.[1]) {
                                    new_obj = { device : step.device, [step.name] : {value : "", unit : step.unit, range : step.value }};
                                }
                                if (step.option.age == undefined) {
                                    new_obj = { device : step.device, [step.name] : {value : "", unit : step.unit, range : step.value }};
                                }
                            } 
                            if (step.option == null) {
                                new_obj = { device : step.device, [step.name] : {value : "", unit : step.unit, range : step.value }};
                            }
                            Object.assign(obj, new_obj);
                        })
                        results.forEach(r => {
                            if (r["device"] == obj["device"]) {
                                Object.assign(r, obj);
                            }
                        })
                    }))
                }
            }
            const job_step: JobNS.Step = {
                id: order.ref_id,
                job_ref_id: step.job_ref_id,
                job_id: job_id,
                code: step_code,
                type: step.type,
                order_id: order.id,
                status: JobNS.StepStatus.New,
                location_id: step.location_id,
                created_by: step.created_by,
                results: results,
                ctime: now,
                mtime: now,
            }
            await this.dal.CreateStep(ctx, job_step);
            return job_step;
        });
    }

    async CreateJob(ctx: ContextNS.Context, params: JobNS.CreateJobParams) {
        if (params.ref === 'customer') {
            await this.customerBLL.GetCustomer(params.ref_id);
        } else {
            throw JobNS.Errors.ErrJobRefNotAllowed;
        }
        return this.contextBLL.RunTransaction(ctx, async (tx) => {
            const now = Date.now();
            const date = format(now, 'yyyy-MM-dd');
            const count = await this.dal.CountJob(tx, {
                date
            });
            const date_pos = `${count + 1}`;
            const job: JobNS.Job = {
                id: JobNS.Generator.NewJobId(),
                date,
                date_pos,
                ref: params.ref,
                ref_id: params.ref_id,
                created_by: params.created_by,
                ctime: now,
                mtime: now,
                args: params.args,
                state: {},
            }
            await this.dal.CreateJob(tx, job);
            for (const step of params.steps) {
                step.job_ref_id = job.ref_id;
                await this.AddStep(tx, job.id, step);
            }
            return job;
        });
    }

    async SetJobState(ctx: ContextNS.Context, id: string, params: JobNS.SetJobStateParams) {
        const job = await this.GetJob(ctx, id);
        job.state = Object.assign(job.state || {}, params.state);
        job.modified_by = params.modified_by;
        job.mtime = Date.now();
        await this.dal.UpdateJob(ctx, job);
        return job;
    }

    async FinishStep(ctx: ContextNS.Context, id: string, params: JobNS.FinishStepParams) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const job_step = await this.GetStep(ctx, id);
            if (params.results) {
                job_step.status = JobNS.StepStatus.Done;
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

    async UpdateStep(ctx: ContextNS.Context, id: string, params: JobNS.UpdateStepParams) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const job_step = await this.GetStep(ctx, id);
            if (params.status) {
                if (params.status === JobNS.StepStatus.Cancel && job_step.status !== JobNS.StepStatus.Ready) {
                    throw JobNS.Errors.ErrCancelStep
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

    async ListJob(ctx: ContextNS.Context, query: JobNS.QueryJobParams) {
        const docs = await this.dal.ListJob(ctx, query);
        const view_jobs = await Promise.all(
            docs.map(doc => this.ViewJob(ctx, doc.id))
        )
        return view_jobs;
    }
}



