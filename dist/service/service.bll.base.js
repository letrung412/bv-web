"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBLLBase = void 0;
const service_1 = require("./service");
class ServiceBLLBase {
    constructor(dal) {
        this.dal = dal;
    }
    async init() { }
    async ListService() {
        const docs = await this.dal.ListService();
        return docs.sort((a, b) => a.code.localeCompare(b.code));
    }
    async GetService(id) {
        const service = await this.dal.GetService(id);
        if (!service) {
            throw service_1.ServiceNS.Errors.ErrServiceNotFound;
        }
        return service;
    }
    async ViewService(id) {
        const service = await this.GetService(id);
        const steps = await this.ListStep({ service_id: service.id });
        const view_service = {
            ...service,
            steps
        };
        return view_service;
    }
    async CreateService(params) {
        const now = Date.now();
        const service = {
            id: service_1.ServiceNS.Generator.NewServiceId(),
            code: params.code,
            name: params.name,
            price: params.price,
            origin_price: params.origin_price,
            type: params.type,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateService(service);
        return service;
    }
    async UpdateService(id, params) {
        const service = await this.GetService(id);
        if (params.price) {
            service.price = params.price;
        }
        if (params.origin_price) {
            service.origin_price = params.price;
        }
        await this.dal.UpdateService(service);
        return service;
    }
    async UpdatePriceDiscount(type, discount) {
        const services = await this.ListService();
        const docs = await Promise.all(services.map(async (service) => {
            if (service.type == type) {
                const price = (Math.ceil((service.origin_price * (1 - discount)) * 0.001)) * 1000;
                service.price = price;
                await this.dal.UpdateService(service);
            }
            return service;
        }));
        return docs;
    }
    async DeleteService(id) {
        const service = await this.GetService(id);
        await this.dal.DeleteService(id);
        return service;
    }
    //--------------------------
    async ListPolicy() {
        return this.dal.ListPolicy();
    }
    async GetPolicy(id) {
        const price_policy = await this.dal.GetPolicy(id);
        if (!price_policy) {
            throw service_1.ServiceNS.Errors.ErrServicePolicyNotFound;
        }
        return price_policy;
    }
    async CreatePolicy(params) {
        const now = Date.now();
        const price_policy = {
            id: service_1.ServiceNS.Generator.NewPolicyId(),
            code: params.code,
            name: params.name,
            discount: params.discount,
            ctime: now,
            mtime: now
        };
        await this.dal.CreatePolicy(price_policy);
        return price_policy;
    }
    async UpdatePolicy(id, params) {
        const price_policy = await this.GetPolicy(id);
        price_policy.code = params.code;
        price_policy.name = params.name;
        price_policy.discount = params.discount;
        await this.dal.UpdatePolicy(price_policy);
    }
    async DeletePolicy(id) {
        const price_policy = await this.GetPolicy(id);
        await this.dal.DeletePolicy(id);
        return price_policy;
    }
    async getStep(id) {
        const step = await this.dal.GetStep(id);
        if (!step) {
            throw service_1.ServiceNS.Errors.ErrServiceStepNotFound;
        }
        return step;
    }
    async AddStep(params) {
        const now = Date.now();
        const docs = Promise.all(params.steps.map(async (el) => {
            const step = {
                id: service_1.ServiceNS.Generator.NewServiceStepId(),
                service_id: params.service_id,
                name: el.name,
                unit: el.unit,
                value: el.value,
                device: el.device,
                option: el.option
            };
            await this.dal.CreateStep(step);
            return step;
        }));
        return docs;
    }
    async ListStep(filter) {
        const step = await this.dal.ListStep(filter);
        return step;
    }
    async UpdateStep(id, params) {
        const doc = await this.getStep(id);
        const step = { ...doc, ...params };
        await this.dal.UpdateStep(step);
    }
    async DeleteStep(id) {
        const step = await this.getStep(id);
        await this.dal.DeleteStep(id);
        return step;
    }
}
exports.ServiceBLLBase = ServiceBLLBase;
//# sourceMappingURL=service.bll.base.js.map