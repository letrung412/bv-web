"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleBLLBase = void 0;
const ctx_1 = require("../ext/ctx");
const job_1 = require("../job/job");
const sample_1 = require("./sample");
class SampleBLLBase {
    constructor(dal, jobBLL, orderBLL, contextBLL) {
        this.dal = dal;
        this.jobBLL = jobBLL;
        this.orderBLL = orderBLL;
        this.contextBLL = contextBLL;
    }
    async init() { }
    async GetSample(ctx, id) {
        const doc = await this.dal.GetSample(ctx, id);
        if (!doc) {
            throw sample_1.SampleNS.Errors.ErrSampleNotFound;
        }
        const order = await this.orderBLL.ViewOrder(ctx, doc.order_id);
        const customer = order.customer;
        delete customer["contacts"];
        return { ...doc, customer };
    }
    async ListSample() {
        const filter = {};
        const docs = await this.dal.ListSample(filter);
        return docs;
    }
    async ListSampleByDevice(device) {
        const filter = { device: device };
        const docs = await this.dal.ListSample(filter);
        return docs;
    }
    async CreateSample(params) {
        if (params.order_id.trim().length == 0) {
            const sample = {
                id: sample_1.SampleNS.Generator.NewSampleId(),
                order_id: "",
                status: "cancel",
                ctime: Date.now(),
                mtime: Date.now()
            };
            await this.dal.CreateSample(sample);
            return [sample];
        }
        else {
            const ctx = ctx_1.ContextNS.New();
            const order = await this.orderBLL.ViewOrder(ctx, params.order_id);
            const job_step = await this.jobBLL.GetStep(ctx, order.ref_id);
            let BC2800 = [], BS200E = [], UA66 = [], Other = [], Test = [], Immune = [];
            Promise.all(order.items.map(item => {
                if (item.ref_value["steps"].length > 0 && item.quantity > 0) {
                    let device = item.ref_value["steps"][0].device;
                    if (device == sample_1.SampleNS.Device.BC2800) {
                        delete item.ref_value["steps"];
                        BC2800.push(item.ref_value);
                    }
                    else if (device == sample_1.SampleNS.Device.BS200E) {
                        delete item.ref_value["steps"];
                        BS200E.push(item.ref_value);
                    }
                    else if (device == sample_1.SampleNS.Device.UA66) {
                        delete item.ref_value["steps"];
                        UA66.push(item.ref_value);
                    }
                    else if (device == sample_1.SampleNS.Device.Test) {
                        delete item.ref_value["steps"];
                        Test.push(item.ref_value);
                    }
                    else if (device == sample_1.SampleNS.Device.Immune) {
                        delete item.ref_value["steps"];
                        Immune.push(item.ref_value);
                    }
                    else if (device == sample_1.SampleNS.Device.Other) {
                        delete item.ref_value["steps"];
                        Other.push(item.ref_value);
                    }
                    else if (device == undefined) {
                        delete item.ref_value["steps"];
                        Other.push(item.ref_value);
                    }
                }
                else {
                    delete item.ref_value["steps"];
                    Other.push(item.ref_value);
                }
            }));
            let samples = [];
            for (let key of Object.keys(sample_1.SampleNS.Device)) {
                if (eval(key).length > 0) {
                    const sample = {
                        id: sample_1.SampleNS.Generator.NewSampleId(),
                        order_id: params.order_id,
                        services: eval(key),
                        device: sample_1.SampleNS.Device[key],
                        status: "done",
                        ctime: Date.now(),
                        mtime: Date.now()
                    };
                    await this.dal.CreateSample(sample);
                    samples.push(sample);
                }
            }
            let new_results = {};
            let results = [];
            if (job_step.results.length >= 6) {
                job_step.results.forEach((el, index) => {
                    if (index < 6) {
                        results.push(el);
                    }
                });
                results.forEach(el => {
                    if (Object.keys(el).length > 1 && el["sample_id"] != undefined) {
                        new_results = { ...el };
                        if (el["device"] == sample_1.SampleNS.Device.Other) {
                            Object.keys(el).forEach(key => {
                                new_results[key] = null;
                            });
                        }
                        else {
                            Object.keys(el).forEach(key => {
                                new_results[key] = "";
                            });
                        }
                        new_results["device"] = el["device"];
                        samples.forEach(sample => {
                            if (sample["device"] == el["device"]) {
                                new_results["sample_id"] = sample.id;
                                new_results["ctime"] = "";
                            }
                        });
                        job_step.results.push(new_results);
                    }
                });
            }
            samples.forEach(sample => {
                if (job_step.results.length < 7) {
                    job_step.results.forEach(result => {
                        if (sample["device"] == result["device"] && result["sample_id"] == undefined) {
                            result["sample_id"] = sample.id;
                            result["ctime"] = "";
                        }
                    });
                }
            });
            await this.jobBLL.UpdateStep(ctx, job_step.id, job_step);
            return samples;
        }
    }
    async PostResult(ctx, id, result) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const doc = await this.GetSample(ctx, id);
            doc.result = result;
            doc.mtime = Date.now();
            let obj = {};
            for (let i in result) {
                obj[i] = result[i];
            }
            await this.dal.PostResult(ctx, doc);
            const order = await this.orderBLL.ViewOrder(ctx, doc.order_id);
            const job_step = await this.jobBLL.GetStep(ctx, order.ref_id);
            const results = await Promise.all(job_step.results.map(r => {
                if (r["sample_id"] === doc.id) {
                    if (r["device"] === result["device"]) {
                        delete result["device"];
                        r["ctime"] = result["ctime"];
                        Object.entries(result).forEach(array => {
                            if (r[array[0]]) {
                                if (array[1] && array[0] != "ctime") {
                                    r[array[0]]["value"] = array[1];
                                }
                            }
                        });
                    }
                    else {
                        throw sample_1.SampleNS.Errors.ErrMachineNotWorking;
                    }
                }
                return r;
            }));
            const params = {
                status: job_1.JobNS.StepStatus.Running,
                modified_by: job_step.created_by,
                results: results,
            };
            await this.jobBLL.UpdateStep(ctx, job_step.id, params);
            return doc;
        });
    }
}
exports.SampleBLLBase = SampleBLLBase;
//# sourceMappingURL=sample.bll.base.js.map