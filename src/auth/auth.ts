import { OrgNS } from "../org/org";

export namespace UserAuthNS {
    export type User = OrgNS.User;

    export interface UserSecret {
        user_id: string;
        name: string;
        value: string;
        encode: string;
    }
    
    export interface UserSession {
        id: string;
        user_id: string;
        status : "active" | "deactive";
    }

    export interface SecretEncoder {
        name: string;
        encode(plain: string): Promise<string>;
        compare(plain: string, secret: string): Promise<boolean>;
    }
    
    export interface BLL {
        GetUser(id: string): Promise<User>;
    
        SetPassword(user_id: string, password: string): Promise<void>;
        Login(username: string, password: string): Promise<UserSession>;
        GetUserSession(id: string): Promise<UserSession>;
        DisableSession(user_id : string) : Promise<void>
    }
    
    
    export interface DAL {
        SaveUserSecret(value: UserSecret): Promise<void>;
        GetUserSecret(user_id: string, name: string): Promise<UserSecret>;
    
        CreateUserSession(session: UserSession): Promise<void>;
        GetUserSession(id: string): Promise<UserSession>;
        GetSessionByUser(user_id : string) : Promise<UserSession[]>;
        DisableSession(session : UserSession) : Promise<void>
    }
    
    export const Errors = {
        ErrUserHasNoLogin: new Error("user has no login"),
        ErrWrongPassword: new Error("wrong password"),
    }
}