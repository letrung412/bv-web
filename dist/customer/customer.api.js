"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewCustomerAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
// import { NewAuthMiddleware, GetAuthData } from "../auth/auth.api.middleware";
// import { UserAuthNS } from "../auth/auth";
const customer_1 = require("./customer");
function NewCustomerAPI(userAuthBLL, customerBLL) {
    const app = express();
    app.use(express.json());
    const gender_values = Object.values(customer_1.CustomerNS.Gender);
    const id_type_values = Object.values(customer_1.CustomerNS.IDType);
    app.post("/customer/create", async (req, res) => {
        const full_name = http_1.HttpParamValidators.MustBeString(req.body, "full_name", 3);
        const gender = http_1.HttpParamValidators.MustBeOneOf(req.body, "gender", gender_values);
        const birthday = http_1.HttpParamValidators.MustBeString(req.body, "birthday", 2);
        const code = req.body.code;
        const params = {
            full_name,
            gender,
            birthday,
            code,
        };
        const customer = await customerBLL.CreateCustomer(params);
        res.json(customer);
    });
    app.get("/customer/list", async (req, res) => {
        if (req.query.full_name) {
            const full_name = http_1.HttpParamValidators.MustBeString(req.query, "full_name");
        }
        if (req.query.birthday) {
            const birthday = http_1.HttpParamValidators.MustBeString(req.query, "birthday");
        }
        const query = req.query;
        const docs = await customerBLL.ListCustomer(query);
        res.json(docs);
    });
    app.post("/customer/delete", async (req, res) => {
        const doc = await customerBLL.DeleteCustomer(req.query.id);
        res.json(doc);
    });
    app.post("/customer/update", async (req, res) => {
        const customer_id = http_1.HttpParamValidators.MustBeString(req.body, "id");
        const params = {
            birthday: http_1.HttpParamValidators.MustBeString(req.body, 'birthday', 2),
            gender: http_1.HttpParamValidators.MustBeOneOf(req.body, 'gender', gender_values),
            full_name: http_1.HttpParamValidators.MustBeString(req.body, 'full_name', 2),
        };
        await customerBLL.UpdateCustomer(customer_id, params);
        res.json(1);
    });
    app.get("/customer/get", async (req, res) => {
        let id = req.query.id;
        const code = req.query.code;
        if (!id && !code) {
            throw new http_1.HttpError(`id or code is required`, 400);
        }
        if (!id) {
            const customer = await customerBLL.GetCustomerByCode(code);
            id = customer.id;
        }
        const view_customer = await customerBLL.ViewCustomer(id);
        res.json(view_customer);
    });
    app.post("/customer/allergy", async (req, res) => {
        let id = req.query.id;
        const params = {
            allergy: req.body.allergy
        };
        const docs = await customerBLL.UpdateAllergy(id, params);
        res.json(1);
    });
    app.post("/contact/:action(add|update)", async (req, res) => {
        const params = req.body;
        if (params.idnum) {
            const idtype = http_1.HttpParamValidators.MustBeOneOf(req.body, "idtype", id_type_values);
        }
        const { action } = req.params;
        if (action === 'update') {
            const id = req.body.id;
            await customerBLL.UpdateContact(id, params);
            res.json(1);
        }
        else if (action === 'add') {
            const customer_id = http_1.HttpParamValidators.MustBeString(req.body, "customer_id", 8);
            const create_params = {
                ...params,
                customer_id,
            };
            const contact = await customerBLL.CreateContact(create_params);
            res.json(contact);
        }
    });
    app.get("/customer/search", async (req, res) => {
        const text = req.query.text;
        const docs = await customerBLL.SearchCustomer(text);
        res.json(docs);
    });
    app.post("/contact/remove", async (req, res) => {
        const doc = await customerBLL.DeleteContact(req.body.id);
        res.json(doc);
    });
    app.post("/visit/create", async (req, res) => {
        const customer_id = http_1.HttpParamValidators.MustBeString(req.body, "customer_id", 3);
        const customerContact = await customerBLL.AddVisit(customer_id);
        res.json(customerContact);
    });
    app.get("/visit/get", async (req, res) => {
        const customer_id = req.query.customer_id;
        const docs = await customerBLL.ListVisit(customer_id);
        res.json(docs);
    });
    return app;
}
exports.NewCustomerAPI = NewCustomerAPI;
//# sourceMappingURL=customer.api.js.map