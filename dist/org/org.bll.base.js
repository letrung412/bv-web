"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgBLLBase = void 0;
const customer_1 = require("../customer/customer");
const org_1 = require("./org");
class OrgBLLBase {
    constructor(dal, customerDAL) {
        this.dal = dal;
        this.customerDAL = customerDAL;
    }
    async init() { }
    async ListOrg() {
        return this.dal.ListOrg();
    }
    async CreateOrg(params) {
        const now = Date.now();
        const org = {
            id: org_1.OrgNS.Generator.NewOrgId(),
            name: params.name,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateOrg(org);
        return org;
    }
    async ListUser() {
        return this.dal.ListUser();
    }
    async GetUser(id) {
        const user = await this.dal.GetUser(id);
        if (!user) {
            throw org_1.OrgNS.Errors.ErrUserNotFound;
        }
        return user;
    }
    async GetUserByUsername(username) {
        const user = await this.dal.GetUserByUsername(username);
        if (!user) {
            throw org_1.OrgNS.Errors.ErrUserNotFound;
        }
        return user;
    }
    async CreateUser(params) {
        const now = Date.now();
        const user = {
            id: org_1.OrgNS.Generator.NewUserId(),
            username: params.username,
            org_id: params.org_id,
            roles: params.roles,
            full_name: params.full_name.toUpperCase(),
            gender: params.gender,
            phone: params.phone,
            birthday: params.birthday,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateUser(user);
        const customer = {
            id: customer_1.CustomerNS.Generator.NewCustomerId(),
            code: `CB${user.ctime}`,
            full_name: user.full_name,
            gender: user.gender,
            birthday: user.birthday,
        };
        await this.customerDAL.CreateCustomer(customer);
        const contact = {
            id: customer_1.CustomerNS.Generator.NewCustomerContactId(),
            customer_id: customer.id,
            full_name: "",
            idnum: null,
            phone: user.phone,
            idtype: null,
            address: {
                province: "",
                district: "",
                ward: "",
                street: "Tiên Du"
            },
            email: "",
            relation: null,
        };
        await this.customerDAL.CreateContact(contact);
        return user;
    }
    async UpdateUser(id, params) {
        const user = await this.GetUser(id);
        if (params.full_name) {
            params.full_name = params.full_name.toUpperCase();
        }
        const customer = await this.customerDAL.GetCustomerByCode(`CB${user.ctime}`);
        const contacts = await this.customerDAL.ListContact({ customer_id: customer.id });
        if (params.phone) {
            Promise.all(contacts.map(async (c) => {
                c.phone = params.phone;
                await this.customerDAL.UpdateContact(c);
            }));
        }
        const doc = { ...user, ...params };
        delete params.roles;
        delete params.phone;
        const update = { ...customer, ...params };
        doc.mtime = Date.now();
        await this.dal.UpdateUser(doc);
        await this.customerDAL.UpdateCustomer(update);
    }
    async DeleteUser(id) {
        const user = await this.GetUser(id);
        const customer = await this.customerDAL.GetCustomerByCode(`CB${user.ctime}`);
        const contacts = await this.customerDAL.ListContact({ customer_id: customer.id });
        await this.dal.DeleteUser(id);
        await this.customerDAL.DeleteCustomer(customer.id);
        Promise.all(contacts.map(async (contact) => {
            await this.customerDAL.DeleteContact(contact.id);
        }));
        return user;
    }
}
exports.OrgBLLBase = OrgBLLBase;
