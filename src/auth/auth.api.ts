import * as express from 'express';
import { HttpError, HttpStatusCodes, HttpParamValidators } from '../lib/http';
import { UserAuthNS } from './auth';
import { NewAuthMiddleware, GetAuthData } from './auth.api.middleware';
import { OrgNS } from '../org/org';

export function NewAuthAPI(
    userAuthBLL: UserAuthNS.BLL,
) {
    const app = express();
    app.post("/login", async (req, res) => {
        const { username, password } = req.body;
        try {
            const session = await userAuthBLL.Login(username, password);
            res.json(session);
            
        } catch (e) {
            switch (e) {
                case OrgNS.Errors.ErrUserNotFound:
                case UserAuthNS.Errors.ErrWrongPassword:
                case UserAuthNS.Errors.ErrUserHasNoLogin:
                    throw new HttpError(e.message, HttpStatusCodes.Unauthorized);
                default:
                    throw e;
            }
        }
    });

    // TODO: check user permissions
    app.post("/user/set_password", async (req, res) => {
        const user_id = HttpParamValidators.MustBeString(req.body, 'id');
        const password = HttpParamValidators.MustBeString(req.body, 'password', 6);
        await userAuthBLL.SetPassword(user_id, password);
        res.json(1);
    });
    app.use(NewAuthMiddleware(userAuthBLL));
    app.get("/me", async (req, res) => {
        const session = GetAuthData(req);
        try {
            const user = await userAuthBLL.GetUser(session.user_id);
            res.json({ session, user });
        } catch (e) {
            if (e === OrgNS.Errors.ErrUserNotFound) {
                throw new HttpError(e.message, HttpStatusCodes.Unauthorized);
            } else {
                throw e;
            }
        }
    });
    app.get("/me/set_password", async (req, res) => {
        const session = GetAuthData(req);
        const password = HttpParamValidators.MustBeString(req.body, 'password', 6);
        await userAuthBLL.SetPassword(session.user_id, password);
        res.json(1);
    });

    const commonErrors = new Set([
        ...Object.values(UserAuthNS.Errors),
    ]);
    app.use((err: Error, req, res, next) => {
        if (commonErrors.has(err)) {
            err = new HttpError(err.message, HttpStatusCodes.BadRequest);
        }
        next(err);
    });
    return app;
}