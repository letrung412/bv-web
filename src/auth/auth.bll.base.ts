import rand from "../lib/rand";
import { UserAuthNS } from "./auth";
import { AuthSecretPlainText, AuthSecretBcrypt } from "./auth.secret";
import { OrgNS } from "../org/org";

const secretEncoders: Map<string, UserAuthNS.SecretEncoder> = new Map([
    ['', new AuthSecretPlainText()],
    ['bcrypt', new AuthSecretBcrypt(8)]
]);

export class UserAuthBLLBase implements UserAuthNS.BLL {
    constructor(
        private dal: UserAuthNS.DAL,
        private orgBLL: OrgNS.BLL
    ) { }

    async init() {

    }

    async GetUser(id: string) {
        return this.orgBLL.GetUser(id);
    }

    async SetPassword(user_id: string, password: string) {
        // check user exist
        await this.orgBLL.GetUser(user_id);
        const encoder = secretEncoders.get('');
        const value = await encoder.encode(password);
        const secret: UserAuthNS.UserSecret = {
            user_id,
            name: "password",
            value,
            encode: encoder.name,
        }
        await this.dal.SaveUserSecret(secret);
    }

    async Login(username: string, password: string) {
        const user = await this.orgBLL.GetUserByUsername(username);
        // comapre password
        const secret = await this.dal.GetUserSecret(user.id, "password");
        if (!secret) {
            throw UserAuthNS.Errors.ErrUserHasNoLogin;
        }
        const encoder = secretEncoders.get(secret.encode);
        if (!encoder) {
            throw UserAuthNS.Errors.ErrWrongPassword;
        }
        const ok = await encoder.compare(password, secret.value);
        if (!ok) {
            throw UserAuthNS.Errors.ErrWrongPassword;
        }
        const session: UserAuthNS.UserSession = {
            id: rand.alphabet(16),
            user_id: user.id,
            status : "active",
        };
        await this.dal.CreateUserSession(session);
        return session;
    }

    async GetUserSession(id: string) {
        return this.dal.GetUserSession(id);
    }

    async DisableSession(user_id: string) {
        const docs = await this.dal.GetSessionByUser(user_id);
        await Promise.all(docs.map(async doc => {
            doc.status = "deactive";
            await this.dal.DisableSession(doc);
        }));
    }
}