import { ProductNS } from './product';
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes } from "../lib/mongodb";

export class ProductDALMongo implements ProductNS.DAL {
    constructor(
        private db: MongoDB
    ) { }

    async init() { 
        this.partCl.createIndex({name : 1}, {name : "name", unique : true, background : true});
    }
    private productCl = this.db.collection("product");
    private producerCl = this.db.collection("product_producer");
    private partCl = this.db.collection("product_part");

    //PRODUCER
    async ListProducer() {
        const docs = await this.producerCl.find().toArray();
        return FromMongoData.Many<ProductNS.Producer>(docs);
    }

    async GetProducer(id: string) {
        const doc = await this.producerCl.findOne({ _id: id });
        return FromMongoData.One<ProductNS.Producer>(doc);
    }

    async UpdateProducer(producer: ProductNS.Producer) {
        const doc = ToMongoData.One(producer);
        await this.producerCl.updateOne({ _id: producer.id }, { $set: doc });
    }

    async DeleteProducer(id: string) {
        await this.producerCl.deleteOne({ _id: id });
    }

    async CreateProducer(producer: ProductNS.Producer) {
        const doc = ToMongoData.One(producer);
        await this.producerCl.insertOne(doc);
    }
    //PART
    async CreatePart(part: ProductNS.Part) {
        try {
            const doc = ToMongoData.One(part);
            await this.partCl.insertOne(doc);
        } catch (error) {
            if (error.code === MongoErrorCodes.Duplicate) {
                throw ProductNS.Errors.ErrProductPartExist
            } else {
                throw error;
            }
        }
    }

    async ListPart() {
        const docs = await this.partCl.find().toArray();
        return FromMongoData.Many<ProductNS.Part>(docs);
    }

    async GetPart(id: string) {
        const doc = await this.partCl.findOne({ _id: id });
        return FromMongoData.One<ProductNS.Part>(doc);
    }

    async UpdatePart(part: ProductNS.Part) {
        const doc = ToMongoData.One(part);
        await this.partCl.updateOne({ _id: part.id }, { $set: doc });
    }

    async DeletePart(id: string) {
        await this.partCl.deleteOne({ _id: id });
    }

    //PRODUCT
    async CreateProduct(product: ProductNS.Product) {
        const doc = ToMongoData.One(product);
        await this.productCl.insertOne(doc);
    }

    async ListProduct() {
        const docs = await this.productCl.find().toArray();
        return FromMongoData.Many<ProductNS.Product>(docs);
    }

    async GetProduct(id: string) {
        const doc = await this.productCl.findOne({ _id: id });
        return FromMongoData.One<ProductNS.Product>(doc);
    }

    async UpdateProduct(product: ProductNS.Product) {
        const doc = ToMongoData.One(product);
        await this.productCl.updateOne({ _id: product.id }, { $set: doc });
    }

    async DeleteProduct(id: string) {
        await this.productCl.deleteOne({ _id: id });
    }
}