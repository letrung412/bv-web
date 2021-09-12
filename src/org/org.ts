import rand from "../lib/rand";

export namespace OrgNS {
  export enum Role {
    ADMIN = "admin",
    BacSi = 'bac_si',
    LeTan = 'le_tan',
    ThuNgan = 'thu_ngan',
    DuocSi = 'duoc_si',
    KTV = "ki_thuat",
    DieuDuong = "dieu_duong",
    XQquang = "x_quang",
    SieuAm = "sieu_am",
    NoiSoi = "noi_soi",
    Kho = "kho" 
  }

  export enum Gender {
    Male = 'male',
    Female = 'female'
  }

  export interface Org {
    id: string;
    name: string;
    ctime: number;
    mtime: number;
  }

  export interface User {
    id: string;
    org_id: string;
    username: string;
    full_name: string;
    roles: Role[];
    phone: string;
    gender : Gender;
    birthday: string;
    ctime: number;
    mtime: number;
  }

  export interface CreateOrgParams {
    name: string;
  }

  export interface UpdateOrgParams {
    name?: string;
  }

  export interface CreateUserParams {
    username: string;
    org_id: string;
    full_name : string;
    roles: Array<Role>;
    gender: Gender;
    phone: string;
    birthday: string;
  }

  export interface UpdateUserParams {
    full_name? : string;
    roles?: Array<Role>;
    phone?: string;
    gender?: Gender;
    birthday?: string;
  }

  export interface BLL {
    ListOrg(): Promise<Org[]>;
    CreateOrg(params: CreateOrgParams): Promise<Org>;
    ListUser(): Promise<User[]>;
    GetUser(id: string): Promise<User>;
    GetUserByUsername(username: string): Promise<User>;
    CreateUser(params: CreateUserParams): Promise<User>;
    UpdateUser(id: string, params: UpdateUserParams): Promise<void>;
    DeleteUser(id: string): Promise<User>;
  }

  export interface DAL {
    ListOrg(): Promise<Org[]>;
    CreateOrg(Org: Org): Promise<void>;
    ListUser(): Promise<User[]>;
    GetUser(id: string): Promise<User>;
    GetUserByUsername(username: string): Promise<User>;
    CreateUser(User: User): Promise<void>;
    UpdateUser(User: User): Promise<void>;
    DeleteUser(id: string): Promise<void>;
  }

  export const Errors = {
    ErrUserNotFound: new Error("Username not found"),
    ErrUsernameExisted: new Error("Username existed"),
  };

  export const Generator = {
    NewOrgId: () => rand.uppercase(8), // colision 2^20
    NewUserId: () => rand.uppercase(12), // collision 2^30
  };
}
