import * as express from 'express';
import { HttpError, HttpStatusCodes, HttpParamValidators } from '../lib/http';
import { ServiceNS } from './service';
import { UserAuthNS } from '../auth/auth';
import { endOfDay, format, startOfDay, differenceInYears , parse} from "date-fns";
export function NewServiceAPI(
    userAuthBLL: UserAuthNS.BLL,
    serviceBLL: ServiceNS.BLL
) {
    const app = express();
    const service_types = Object.values(ServiceNS.Type);

    app.post("/service/create", async (req, res) => {
        const code = HttpParamValidators.MustBeString(req.body, 'code');
        const name = HttpParamValidators.MustBeString(req.body, 'name');
        const price = req.body.price;
        const origin_price = req.body.origin_price;
        const type = HttpParamValidators.MustBeOneOf(req.body, 'type', service_types);
        const params: ServiceNS.CreateServiceParams = {
            code,
            name,
            price,
            origin_price,
            type
        };
        const service = await serviceBLL.CreateService(params);
        res.json(service);
    });

    app.get("/service/list", async (req, res) => {
        const docs = await serviceBLL.ListService();
        res.json(docs);
    });

    app.get("/service/get", async (req, res) => {
        const id = req.query.id as string;
        const doc = await serviceBLL.ViewService(id);
        res.json(doc);
    });

    app.post("/service/update", async (req, res) => {
        const id = req.body.id;
        const params: ServiceNS.UpdateServiceParams = {};
        if (req.body.price) {
            params.price = req.body.price;
        }
        if (req.body.origin_price) {
            params.origin_price = req.body.origin_price;
        }
        const doc = await serviceBLL.UpdateService(id, params);
        res.json(doc);
    });

    app.post("/service/discount", async (req,res) => {
        const discount = req.body.discount as number * 0.01;
        const type = HttpParamValidators.MustBeOneOf(req.body, 'type', service_types);
        const docs = await serviceBLL.UpdatePriceDiscount(type, discount);
        res.json(docs);
    })

    app.post("/service/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeleteService(id);
        res.json(doc);
    })

    app.post("/policy/create", async (req, res) => {
        const code = HttpParamValidators.MustBeString(req.body, 'code');
        const name = HttpParamValidators.MustBeString(req.body, 'name');
        const discount = req.body.discount;
        const params: ServiceNS.CreatePolicyParams = {
            code,
            name,
            discount
        }
        const policy = await serviceBLL.CreatePolicy(params);
        res.json(policy);
    });

    app.get("/policy/list", async (req, res) => {
        const docs = await serviceBLL.ListPolicy();
        res.json(docs);
    });

    app.get("/policy/get", async (req, res) => {
        const id = (req.query as any).id;
        const doc = await serviceBLL.GetPolicy(id);
        res.json(doc);
    });

    app.post("/policy/update", async (req, res) => {
        const id = req.body.id;
        const code = HttpParamValidators.MustBeString(req.body, 'code');
        const name = HttpParamValidators.MustBeString(req.body, 'name');
        const discount = req.body.discount;
        const params: ServiceNS.UpdatePolicyParams = {
            code,
            name,
            discount
        };
        await serviceBLL.UpdatePolicy(id, params);
        res.json(1);
    });

    app.post("/policy/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeletePolicy(id);
        res.json(doc)
    });

    app.get("/step/list", async (req, res) => {
        let filter = {} as any;
        if (req.query.service_id) {
            filter.service_id = req.query.service_id as string;
        }
        const docs = await serviceBLL.ListStep(filter);
        res.json(docs);
    })

    app.post("/step/create", async (req, res) => {
        const service_id = HttpParamValidators.MustBeString(req.body, 'service_id');
        const steps = req.body.steps;
        const params = {
            service_id,
            steps
        }
        const docs = await serviceBLL.AddStep(params);
        res.json(docs.length);
    })

    app.post("/step/update", async (req, res) => {
        const id = req.body.id;
        const service_id = HttpParamValidators.MustBeString(req.body, 'service_id');
        const params: ServiceNS.UpdateStepParams = {
            service_id,
            ...req.body
        }
        await serviceBLL.UpdateStep(id, params);
        res.json(1);
    });

    app.post("/step/delete", async (req, res) => {
        const id = req.body.id;
        const doc = await serviceBLL.DeleteStep(id);
        res.json(1);
    });

    return app;
}

