import { CustomerNS } from "./customer";
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";

export class CustomerDALMongo implements CustomerNS.DAL {
  constructor(private db: MongoDB) { }

  async init() {
    this.col_customer.createIndex("code", { unique: true });
  }

  private col_customer = this.db.collection("customer");
  private col_customer_contact = this.db.collection("customer_contact");
  private col_customer_visit = this.db.collection("customer_visit");

  async ListCustomer(query: CustomerNS.QueryCustomerParams) {
    const filter = {} as any;
    if (Array.isArray(query.id)) {
      filter._id = { $in: query.id };
    }
    if (query.birthday) {
      filter.birthday = query.birthday;
    }
    if (query.full_name) {
      filter.full_name = query.full_name;
    }
    const docs = await this.col_customer.find(filter).toArray();
    return FromMongoData.Many<CustomerNS.Customer>(docs);
  }

  async DeleteCustomer(id: string) {
    await this.col_customer.deleteOne({ _id: id });
  }

  async GetCustomer(id: string) {
    const doc = await this.col_customer.findOne({ _id: id });
    return FromMongoData.One<CustomerNS.Customer>(doc);
  }

  async GetCustomerByCode(code: string) {
    const doc = await this.col_customer.findOne({ code: code });
    return FromMongoData.One<CustomerNS.Customer>(doc);
  }

  async CreateCustomer(customer: CustomerNS.Customer) {
    try {
      const doc = ToMongoData.One(customer);
      await this.col_customer.insertOne(doc);
    } catch (err) {
      if (err.code === MongoErrorCodes.Duplicate) {
        throw CustomerNS.Errors.ErrCustomerCodeExisted;
      } else {
        throw err;
      }
    }
  }

  async UpdateCustomer(customer: CustomerNS.Customer) {
    const doc = ToMongoData.One(customer);
    await this.col_customer.updateOne({ _id: customer.id }, { $set: doc });
  }

  async UpdateAllergy(customer : CustomerNS.Customer) {
    const doc = ToMongoData.One(customer);
    await this.col_customer.updateOne({ _id: customer.id }, { $set: doc });
  }

  async GetContact(id: string) {
    const doc = await this.col_customer_contact.findOne({
      _id: id,
    });
    return FromMongoData.One<CustomerNS.Contact>(doc);
  }

  async UpdateContact(contact: CustomerNS.Contact) {
    const doc = ToMongoData.One(contact);
    await this.col_customer_contact.updateOne(
      { _id: contact.id },
      { $set: doc }
    );
  }

  async CreateContact(Contact: CustomerNS.Contact) {
    const doc = ToMongoData.One(Contact);
    await this.col_customer_contact.insertOne(doc);
  }

  async ListContact(query: CustomerNS.QueryContactParams) {
    const filter = {} as any;
    if (query.customer_id) {
      filter.customer_id = query.customer_id;
    }
    if (query.phone) {
      filter.phone = query.phone;
    }
    if (Array.isArray(query.id)) {
      filter._id = { $in: query.id };
    }
    const docs = await this.col_customer_contact.find(filter).toArray();
    return FromMongoData.Many<CustomerNS.Contact>(docs);
  }

  async DeleteContact(id: string) {
    await this.col_customer_contact.deleteOne({ _id: id });
  }

  async CreateVisit(VisitHistory: CustomerNS.Visit) {
    const doc = ToMongoData.One(VisitHistory);
    await this.col_customer_visit.insertOne(doc);
  }

  async ListVisit(customer_id: string) {
    const docs = await this.col_customer_visit
      .find({ customer_id })
      .toArray();
    return FromMongoData.Many<CustomerNS.Visit>(docs);
  }
}
