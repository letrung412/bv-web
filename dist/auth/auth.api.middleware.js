"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAuthMiddleware = exports.GetAuthData = void 0;
const http_1 = require("../lib/http");
const AUTH_DATA_SYMBOL = Symbol('auth-data');
function setAuthData(ctx, data) {
    ctx[AUTH_DATA_SYMBOL] = data;
}
function GetAuthData(ctx) {
    return ctx[AUTH_DATA_SYMBOL];
}
exports.GetAuthData = GetAuthData;
function NewAuthMiddleware(userAuthBLL) {
    return async (req, res) => {
        const header = req.headers['authorization'];
        if (!header || !header.startsWith('Bearer ')) {
            throw new http_1.HttpError("missing access token", 401);
        }
        const session_id = header.substr('Bearer '.length);
        const session = await userAuthBLL.GetUserSession(session_id);
        if (!session) {
            throw new http_1.HttpError("session not found", 401);
        }
        else if (session.status == "deactive") {
            throw new http_1.HttpError("session expired please login again", 401);
        }
        else {
            setAuthData(req, session);
        }
    };
}
exports.NewAuthMiddleware = NewAuthMiddleware;
