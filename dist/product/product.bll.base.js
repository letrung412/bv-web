"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBLLBase = void 0;
const product_1 = require("./product");
class ProductBLLBase {
    constructor(dal) {
        this.dal = dal;
    }
    async init() { }
    //PRODUCER
    async ListProducer() {
        return this.dal.ListProducer();
    }
    async GetProducer(id) {
        const producer = await this.dal.GetProducer(id);
        if (!producer) {
            throw product_1.ProductNS.Errors.ErrProducerNotFound;
        }
        return producer;
    }
    async DeleteProducer(id) {
        const producer = await this.GetProducer(id);
        await this.dal.DeleteProducer(id);
        return producer;
    }
    async UpdateProducer(id, params) {
        const producer = await this.GetProducer(id);
        if (params.name) {
            producer.name = params.name;
        }
        if (params.description) {
            producer.description = params.description;
        }
        producer.mtime = Date.now();
        await this.dal.UpdateProducer(producer);
    }
    async CreateProducer(params) {
        const now = Date.now();
        const producer = {
            id: product_1.ProductNS.Generator.NewProducerId(),
            name: params.name,
            description: params.description,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateProducer(producer);
        return producer;
    }
    //PART
    async ListPart() {
        return this.dal.ListPart();
    }
    async GetPart(id) {
        const part = await this.dal.GetPart(id);
        if (!part) {
            throw product_1.ProductNS.Errors.ErrPartNotFound;
        }
        return part;
    }
    async DeletePart(id) {
        const part = await this.GetPart(id);
        await this.dal.DeletePart(id);
        return part;
    }
    async UpdatePart(id, params) {
        const part = await this.GetPart(id);
        if (params.name) {
            part.name = params.name;
        }
        if (params.description) {
            part.description = params.description;
        }
        part.mtime = Date.now();
        await this.dal.UpdatePart(part);
    }
    async CreatePart(params) {
        const now = Date.now();
        const part = {
            id: product_1.ProductNS.Generator.NewPartId(),
            name: params.name,
            description: params.description,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreatePart(part);
        return part;
    }
    //PRODUCT
    async ListProduct() {
        return this.dal.ListProduct();
    }
    async GetProduct(id) {
        const product = await this.dal.GetProduct(id);
        if (!product) {
            throw product_1.ProductNS.Errors.ErrProductNotFound;
        }
        return product;
    }
    async DeleteProduct(id) {
        const product = await this.GetProduct(id);
        await this.dal.DeleteProduct(id);
        return product;
    }
    async UpdateProduct(id, params) {
        const product = await this.GetProduct(id);
        product.name = params.name;
        product.price = params.price;
        product.origin_price = params.origin_price;
        product.producer_id = params.producer_id;
        product.parts = params.parts;
        product.attrs = params.attrs;
        product.unit = params.unit;
        product.mtime = Date.now();
        await this.dal.UpdateProduct(product);
    }
    async CreateProduct(params) {
        const now = Date.now();
        const product = {
            id: product_1.ProductNS.Generator.NewProductId(),
            price: params.price,
            origin_price: params.origin_price,
            unit: params.unit,
            name: params.name,
            producer_id: params.producer_id,
            parts: params.parts,
            attrs: params.attrs,
            ctime: now,
            mtime: now,
        };
        await this.dal.CreateProduct(product);
        return product;
    }
}
exports.ProductBLLBase = ProductBLLBase;
//# sourceMappingURL=product.bll.base.js.map