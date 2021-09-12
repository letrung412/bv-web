import { CustomerNS } from "../customer/customer";
import { OrgNS } from "./org";

export class OrgBLLBase implements OrgNS.BLL {
  constructor(
    private dal: OrgNS.DAL,
    private customerDAL: CustomerNS.DAL
  ) { }

  async init() { }

  async ListOrg() {
    return this.dal.ListOrg();
  }

  async CreateOrg(params: OrgNS.CreateOrgParams) {
    const now = Date.now();
    const org: OrgNS.Org = {
      id: OrgNS.Generator.NewOrgId(),
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

  async GetUser(id: string) {
    const user = await this.dal.GetUser(id);
    if (!user) {
      throw OrgNS.Errors.ErrUserNotFound;
    }
    return user;
  }

  async GetUserByUsername(username: string) {
    const user = await this.dal.GetUserByUsername(username);
    if (!user) {
      throw OrgNS.Errors.ErrUserNotFound;
    }
    return user;
  }

  async CreateUser(params: OrgNS.CreateUserParams) {
    const now = Date.now();
    const user : OrgNS.User = {
      id: OrgNS.Generator.NewUserId(),
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
    const customer : CustomerNS.Customer = {
      id : CustomerNS.Generator.NewCustomerId(),
      code : `CB${user.ctime}`,
      full_name : user.full_name,
      gender : user.gender,
      birthday: user.birthday,
    }
    await this.customerDAL.CreateCustomer(customer);
    const contact : CustomerNS.Contact = {
      id : CustomerNS.Generator.NewCustomerContactId(),
      customer_id : customer.id,
      full_name : "",
      idnum : null,
      phone : user.phone,
      idtype : null,
      address : {
        province : "",
        district : "",
        ward : "",
        street : "Tiên Du"
      },
      email : "",
      relation : null,
    }
    await this.customerDAL.CreateContact(contact);
    return user;
  }

  async UpdateUser(id: string, params: OrgNS.UpdateUserParams) {
    const user = await this.GetUser(id);
    if (params.full_name) {
      params.full_name = params.full_name.toUpperCase();
    }
    const customer = await this.customerDAL.GetCustomerByCode(`CB${user.ctime}`);
    const contacts = await this.customerDAL.ListContact({customer_id : customer.id});
    if (params.phone) {
      Promise.all(contacts.map(async c => {
        c.phone = params.phone
        await this.customerDAL.UpdateContact(c);
      }));
    }
    const doc = {...user, ...params};
    delete params.roles;
    delete params.phone;
    const update = {...customer,...params};
    doc.mtime = Date.now();
    await this.dal.UpdateUser(doc);
    await this.customerDAL.UpdateCustomer(update);
  }

  async DeleteUser(id: string) {
    const user = await this.GetUser(id);
    const customer = await this.customerDAL.GetCustomerByCode(`CB${user.ctime}`);
    const contacts = await this.customerDAL.ListContact({customer_id : customer.id});
    await this.dal.DeleteUser(id);
    await this.customerDAL.DeleteCustomer(customer.id);
    Promise.all(contacts.map(async contact => {
      await this.customerDAL.DeleteContact(contact.id);
    }))
    return user;
  }
}
