"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthBLLBase = void 0;
const rand_1 = require("../lib/rand");
const auth_1 = require("./auth");
const auth_secret_1 = require("./auth.secret");
const secretEncoders = new Map([
    ['', new auth_secret_1.AuthSecretPlainText()],
    ['bcrypt', new auth_secret_1.AuthSecretBcrypt(8)]
]);
class UserAuthBLLBase {
    constructor(dal, orgBLL) {
        this.dal = dal;
        this.orgBLL = orgBLL;
    }
    async init() {
    }
    async GetUser(id) {
        return this.orgBLL.GetUser(id);
    }
    async SetPassword(user_id, password) {
        // check user exist
        await this.orgBLL.GetUser(user_id);
        const encoder = secretEncoders.get('');
        const value = await encoder.encode(password);
        const secret = {
            user_id,
            name: "password",
            value,
            encode: encoder.name,
        };
        await this.dal.SaveUserSecret(secret);
    }
    async Login(username, password) {
        const user = await this.orgBLL.GetUserByUsername(username);
        // comapre password
        const secret = await this.dal.GetUserSecret(user.id, "password");
        if (!secret) {
            throw auth_1.UserAuthNS.Errors.ErrUserHasNoLogin;
        }
        const encoder = secretEncoders.get(secret.encode);
        if (!encoder) {
            throw auth_1.UserAuthNS.Errors.ErrWrongPassword;
        }
        const ok = await encoder.compare(password, secret.value);
        if (!ok) {
            throw auth_1.UserAuthNS.Errors.ErrWrongPassword;
        }
        const session = {
            id: rand_1.default.alphabet(16),
            user_id: user.id,
            status: "active",
        };
        await this.dal.CreateUserSession(session);
        return session;
    }
    async GetUserSession(id) {
        return this.dal.GetUserSession(id);
    }
    async DisableSession(user_id) {
        const docs = await this.dal.GetSessionByUser(user_id);
        await Promise.all(docs.map(async (doc) => {
            doc.status = "deactive";
            await this.dal.DisableSession(doc);
        }));
    }
}
exports.UserAuthBLLBase = UserAuthBLLBase;
//# sourceMappingURL=auth.bll.base.js.map