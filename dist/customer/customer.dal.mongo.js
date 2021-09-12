"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDALMongo = void 0;
const customer_1 = require("./customer");
const mongodb_1 = require("../lib/mongodb");
class CustomerDALMongo {
    constructor(db) {
        this.db = db;
        this.col_customer = this.db.collection("customer");
        this.col_customer_contact = this.db.collection("customer_contact");
        this.col_customer_visit = this.db.collection("customer_visit");
    }
    async init() {
        this.col_customer.createIndex("code", { unique: true });
    }
    async ListCustomer(query) {
        const filter = {};
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
        return mongodb_1.FromMongoData.Many(docs);
    }
    async DeleteCustomer(id) {
        await this.col_customer.deleteOne({ _id: id });
    }
    async GetCustomer(id) {
        const doc = await this.col_customer.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async GetCustomerByCode(code) {
        const doc = await this.col_customer.findOne({ code: code });
        return mongodb_1.FromMongoData.One(doc);
    }
    async CreateCustomer(customer) {
        try {
            const doc = mongodb_1.ToMongoData.One(customer);
            await this.col_customer.insertOne(doc);
        }
        catch (err) {
            if (err.code === 11000 /* Duplicate */) {
                throw customer_1.CustomerNS.Errors.ErrCustomerCodeExisted;
            }
            else {
                throw err;
            }
        }
    }
    async UpdateCustomer(customer) {
        const doc = mongodb_1.ToMongoData.One(customer);
        await this.col_customer.updateOne({ _id: customer.id }, { $set: doc });
    }
    async UpdateAllergy(customer) {
        const doc = mongodb_1.ToMongoData.One(customer);
        await this.col_customer.updateOne({ _id: customer.id }, { $set: doc });
    }
    async GetContact(id) {
        const doc = await this.col_customer_contact.findOne({
            _id: id,
        });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateContact(contact) {
        const doc = mongodb_1.ToMongoData.One(contact);
        await this.col_customer_contact.updateOne({ _id: contact.id }, { $set: doc });
    }
    async CreateContact(Contact) {
        const doc = mongodb_1.ToMongoData.One(Contact);
        await this.col_customer_contact.insertOne(doc);
    }
    async ListContact(query) {
        const filter = {};
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
        return mongodb_1.FromMongoData.Many(docs);
    }
    async DeleteContact(id) {
        await this.col_customer_contact.deleteOne({ _id: id });
    }
    async CreateVisit(VisitHistory) {
        const doc = mongodb_1.ToMongoData.One(VisitHistory);
        await this.col_customer_visit.insertOne(doc);
    }
    async ListVisit(customer_id) {
        const docs = await this.col_customer_visit
            .find({ customer_id })
            .toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
}
exports.CustomerDALMongo = CustomerDALMongo;
//# sourceMappingURL=customer.dal.mongo.js.map