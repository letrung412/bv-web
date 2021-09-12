import { CustomerNS } from "./customer";
import { format, isThisISOWeek } from 'date-fns';
export class CustomerBLLBase implements CustomerNS.BLL {
  constructor(private dal: CustomerNS.DAL) { }

  async init() { }

  async CreateCustomer(params: CustomerNS.CreateCustomerParams) {
    const customer: CustomerNS.Customer = {
      id: CustomerNS.Generator.NewCustomerId(),
      full_name: params.full_name,
      gender: params.gender,
      birthday: params.birthday,
      code: params.code,
    };
    if (!customer.code) {
      customer.code = CustomerNS.Generator.NewCustomerCode();
    }
    await this.dal.CreateCustomer(customer);
    return customer;
  }

  async ListCustomer(query: CustomerNS.QueryCustomerParams) {
    const view_customers = await Promise.all(
      (await this.dal.ListCustomer(query)).map(
        customer => this.ViewCustomer(customer.id)
      )  
    );
    return view_customers;
  }

  async SearchCustomer(text : string) {
    const customer_ids = new Set<string>();
    const by_code = await this.dal.GetCustomerByCode(text);
    if (by_code) {
      customer_ids.add(by_code.id);
    }
    const by_contacts = await this.dal.ListContact({
        phone: text
    });
    for (const c of by_contacts) {
      customer_ids.add(c.customer_id);
    }
    const ids = [...customer_ids.values()];
    const view_customers = await Promise.all(
      ids.map(id => this.ViewCustomer(id))
    );

    return view_customers;
  }

  async DeleteCustomer(customer_id: string) {
    const customer = await this.GetCustomer(customer_id);
    await this.dal.DeleteCustomer(customer_id);
    return customer;
  }

  async GetCustomer(id: string) {
    const customer = await this.dal.GetCustomer(id);
    if (!customer) {
      throw CustomerNS.Errors.ErrCustomerNotFound;
    }
    return customer;
  }

  async ViewCustomer(id: string) {
    const customer = await this.GetCustomer(id);
    const contacts = await this.ListContact({ customer_id: id });
    const view_customer: CustomerNS.ViewCustomer = {
      ...customer,
      contacts,
    };
    return view_customer;
  }

  async GetCustomerByCode(code: string) {
    const customer = await this.dal.GetCustomerByCode(code);
    if (!customer) {
      throw CustomerNS.Errors.ErrCustomerNotFound;
    }
    return customer;
  }

  async UpdateCustomer(
    id: string,
    params: CustomerNS.UpdateCustomerParams
  ) {
    const customer = await this.GetCustomer(id);
    for (const prop in params) {
      if (params[prop]) {
        customer[prop] = params[prop];
      }
    }
    await this.dal.UpdateCustomer(customer);
  }

  async CreateContact(params: CustomerNS.CreateContactParams) {
    const contact: CustomerNS.Contact = {
      id: CustomerNS.Generator.NewCustomerContactId(),
      full_name : params.full_name,
      customer_id: params.customer_id,
      idnum: params.idnum,
      phone: params.phone,
      idtype: params.idtype,
      address: params.address,
      email: params.email,
      relation: params.relation,
    };
    await this.dal.CreateContact(contact);
    return contact;
  }
  async UpdateAllergy(id: string, params : CustomerNS.UpdateAllergyParams) {
    const customer = await this.GetCustomer(id);
    customer.allergy = params.allergy;
    await this.dal.UpdateAllergy(customer)
  }
  
  async ListContact(query: CustomerNS.QueryContactParams) {
    return this.dal.ListContact(query);
  }

  async GetContact(customer_id: string) {
    const customer_contact = await this.dal.GetContact(customer_id);
    if (!customer_contact) {
      throw CustomerNS.Errors.ErrCustomerContactNotFound;
    }
    return customer_contact;
  }

  async DeleteContact(customer_id: string) {
    const customerContact = await this.GetContact(customer_id);
    await this.dal.DeleteContact(customer_id);
    return customerContact;
  }

  async UpdateContact(
    id: string,
    params: CustomerNS.UpdateContactParams
  ) {
    const customer_contact = await this.GetContact(id);
    for (const prop in params) {
      if (params[prop]) {
        customer_contact[prop] = params[prop];
      }
    }
    await this.dal.UpdateContact(customer_contact);
  }

  async AddVisit(customer_id: string) {
    const now = Date.now();
    const visit: CustomerNS.Visit = {
      id: CustomerNS.Generator.NewCustomerVisitId(),
      customer_id: customer_id,
      ctime: now,
    };
    await this.dal.CreateVisit(visit);
    return visit;
  }

  async ListVisit(customer_id: string) {
    return this.dal.ListVisit(customer_id);
  }

}
