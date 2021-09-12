"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAuthAPI = void 0;
const express = require("express");
const http_1 = require("../lib/http");
const auth_1 = require("./auth");
const auth_api_middleware_1 = require("./auth.api.middleware");
const org_1 = require("../org/org");
function NewAuthAPI(userAuthBLL) {
    const app = express();
    app.post("/login", async (req, res) => {
        const { username, password } = req.body;
        try {
            const session = await userAuthBLL.Login(username, password);
            res.json(session);
        }
        catch (e) {
            switch (e) {
                case org_1.OrgNS.Errors.ErrUserNotFound:
                case auth_1.UserAuthNS.Errors.ErrWrongPassword:
                case auth_1.UserAuthNS.Errors.ErrUserHasNoLogin:
                    throw new http_1.HttpError(e.message, 401 /* Unauthorized */);
                default:
                    throw e;
            }
        }
    });
    // TODO: check user permissions
    app.post("/user/set_password", async (req, res) => {
        const user_id = http_1.HttpParamValidators.MustBeString(req.body, 'id');
        const password = http_1.HttpParamValidators.MustBeString(req.body, 'password', 6);
        await userAuthBLL.SetPassword(user_id, password);
        res.json(1);
    });
    app.use(auth_api_middleware_1.NewAuthMiddleware(userAuthBLL));
    app.get("/me", async (req, res) => {
        const session = auth_api_middleware_1.GetAuthData(req);
        try {
            const user = await userAuthBLL.GetUser(session.user_id);
            res.json({ session, user });
        }
        catch (e) {
            if (e === org_1.OrgNS.Errors.ErrUserNotFound) {
                throw new http_1.HttpError(e.message, 401 /* Unauthorized */);
            }
            else {
                throw e;
            }
        }
    });
    app.get("/me/set_password", async (req, res) => {
        const session = auth_api_middleware_1.GetAuthData(req);
        const password = http_1.HttpParamValidators.MustBeString(req.body, 'password', 6);
        await userAuthBLL.SetPassword(session.user_id, password);
        res.json(1);
    });
    const commonErrors = new Set([
        ...Object.values(auth_1.UserAuthNS.Errors),
    ]);
    app.use((err, req, res, next) => {
        if (commonErrors.has(err)) {
            err = new http_1.HttpError(err.message, 400 /* BadRequest */);
        }
        next(err);
    });
    return app;
}
exports.NewAuthAPI = NewAuthAPI;
//# sourceMappingURL=auth.api.js.map