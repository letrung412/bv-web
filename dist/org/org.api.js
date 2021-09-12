"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewOrgAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const org_1 = require("./org");
function NewOrgAPI(userAuthBLL, orgBLL) {
    const app = express();
    const roleType = Object.values(org_1.OrgNS.Role);
    const gender = Object.values(org_1.OrgNS.Gender);
    app.get("/org/list", async (req, res) => {
        const docs = await orgBLL.ListOrg();
        res.json(docs);
    });
    app.post("/org/create", async (req, res) => {
        const params = {
            name: http_1.HttpParamValidators.MustBeString(req.body, "name", 2),
        };
        const doc = await orgBLL.CreateOrg(params);
        res.json(doc);
    });
    app.get("/user/list", async (req, res) => {
        const docs = await orgBLL.ListUser();
        res.json(docs);
    });
    app.get("/user/get", async (req, res) => {
        let doc = {};
        if (req.query.id) {
            const id = http_1.HttpParamValidators.MustBeString(req.query, "id", 8);
            doc = await orgBLL.GetUser(id);
            res.json(doc);
        }
        if (req.query.username) {
            const username = http_1.HttpParamValidators.MustBeString(req.query, "username", 2);
            doc = await orgBLL.GetUserByUsername(username);
            res.json(doc);
        }
    });
    app.post("/user/create", async (req, res) => {
        const roles = Array.from(new Set(req.body.roles));
        const params = {
            username: http_1.HttpParamValidators.MustBeString(req.body, "username", 2),
            org_id: http_1.HttpParamValidators.MustBeString(req.body, "org_id", 8),
            full_name: http_1.HttpParamValidators.MustBeString(req.body, "full_name", 2),
            roles: roles,
            gender: http_1.HttpParamValidators.MustBeOneOf(req.body, "gender", gender),
            phone: http_1.HttpParamValidators.MustBeString(req.body, "phone", 10),
            birthday: req.body.birthday,
        };
        const user = await orgBLL.CreateUser(params);
        res.json(user);
    });
    app.post("/user/update", async (req, res) => {
        const id = http_1.HttpParamValidators.MustBeString(req.query, "id");
        const roles = Array.from(new Set(req.body.roles));
        const params = {};
        if (req.body.full_name) {
            params.full_name = http_1.HttpParamValidators.MustBeString(req.body, "full_name", 2);
        }
        if (req.body.phone) {
            params.phone = http_1.HttpParamValidators.MustBeString(req.body, "phone", 10);
        }
        if (req.body.birthday) {
            params.birthday = http_1.HttpParamValidators.MustBeString(req.body, "birthday", 1);
        }
        if (req.body.roles) {
            params.roles = Array.from(roles);
            await userAuthBLL.DisableSession(id);
        }
        if (req.body.gender) {
            params.gender = req.body.gender;
        }
        await orgBLL.UpdateUser(id, params);
        res.json(1);
    });
    app.post("/user/delete", async (req, res) => {
        const user_id = http_1.HttpParamValidators.MustBeString(req.query, "id", 8);
        await orgBLL.DeleteUser(user_id);
        res.json(1);
    });
    return app;
}
exports.NewOrgAPI = NewOrgAPI;
