"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDALMongo = void 0;
const product_1 = require("./product");
const mongodb_1 = require("../lib/mongodb");
class ProductDALMongo {
    constructor(db) {
        this.db = db;
        this.productCl = this.db.collection("product");
        this.producerCl = this.db.collection("product_producer");
        this.partCl = this.db.collection("product_part");
    }
    async init() {
        this.partCl.createIndex({ name: 1 }, { name: "name", unique: true, background: true });
    }
    //PRODUCER
    async ListProducer() {
        const docs = await this.producerCl.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetProducer(id) {
        const doc = await this.producerCl.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateProducer(producer) {
        const doc = mongodb_1.ToMongoData.One(producer);
        await this.producerCl.updateOne({ _id: producer.id }, { $set: doc });
    }
    async DeleteProducer(id) {
        await this.producerCl.deleteOne({ _id: id });
    }
    async CreateProducer(producer) {
        const doc = mongodb_1.ToMongoData.One(producer);
        await this.producerCl.insertOne(doc);
    }
    //PART
    async CreatePart(part) {
        try {
            const doc = mongodb_1.ToMongoData.One(part);
            await this.partCl.insertOne(doc);
        }
        catch (error) {
            if (error.code === 11000 /* Duplicate */) {
                throw product_1.ProductNS.Errors.ErrProductPartExist;
            }
            else {
                throw error;
            }
        }
    }
    async ListPart() {
        const docs = await this.partCl.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetPart(id) {
        const doc = await this.partCl.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdatePart(part) {
        const doc = mongodb_1.ToMongoData.One(part);
        await this.partCl.updateOne({ _id: part.id }, { $set: doc });
    }
    async DeletePart(id) {
        await this.partCl.deleteOne({ _id: id });
    }
    //PRODUCT
    async CreateProduct(product) {
        const doc = mongodb_1.ToMongoData.One(product);
        await this.productCl.insertOne(doc);
    }
    async ListProduct() {
        const docs = await this.productCl.find().toArray();
        return mongodb_1.FromMongoData.Many(docs);
    }
    async GetProduct(id) {
        const doc = await this.productCl.findOne({ _id: id });
        return mongodb_1.FromMongoData.One(doc);
    }
    async UpdateProduct(product) {
        const doc = mongodb_1.ToMongoData.One(product);
        await this.productCl.updateOne({ _id: product.id }, { $set: doc });
    }
    async DeleteProduct(id) {
        await this.productCl.deleteOne({ _id: id });
    }
}
exports.ProductDALMongo = ProductDALMongo;
//# sourceMappingURL=product.dal.mongo.js.map