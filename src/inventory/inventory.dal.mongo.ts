import { InventoryNS } from './inventory';
import { MongoDB, FromMongoData, ToMongoData, MongoErrorCodes, MongoCommon } from "../lib/mongodb";
import { ContextNS } from '../ext/ctx';

export class InventoryDALMongo implements InventoryNS.DAL {
    constructor(private db: MongoDB) { }
    async init() {
        this.col_inventory_lot.createIndex({ code: 1, warehouse_id: 1 }, { unique: true });
    }

    private col_inventory_warehouse = this.db.collection("inventory_warehouse");
    private col_inventory_lot = this.db.collection("inventory_lot");
    private col_inventory_transaction = this.db.collection("inventory_transaction");

    //WAREHOUSE
    async ListWareHouse() {
        const docs = await this.col_inventory_warehouse.find().toArray();
        return FromMongoData.Many<InventoryNS.WareHouse>(docs);
    }
    async GetWareHouse(id: string) {
        const doc = await this.col_inventory_warehouse.findOne({ _id: id });
        return FromMongoData.One<InventoryNS.WareHouse>(doc);
    }
    async CreateWareHouse(warehouse: InventoryNS.WareHouse) {
        const doc = ToMongoData.One(warehouse);
        await this.col_inventory_warehouse.insertOne(doc);
    }
    async UpdateWareHouse(warehouse: InventoryNS.WareHouse) {
        const doc = ToMongoData.One(warehouse);
        await this.col_inventory_warehouse.updateOne({ _id: warehouse.id }, { $set: doc });
    }

    //TRANSACTION
    async ListTransaction(query: InventoryNS.QueryTransaction) {
        const filter = {} as any;
        if (query.warehouse_id) {
            filter.warehouse_id = query.warehouse_id;
        }
        if (query.lot_id) {
            filter.lot_id = query.lot_id;
        }
        if (query.product_id) {
            filter.product_id = query.product_id;
        }
        const docs = await this.col_inventory_transaction.find(filter).toArray();
        return FromMongoData.Many<InventoryNS.Transaction>(docs);
    }

    async GetTransaction(id: string) {
        const doc = await this.col_inventory_transaction.findOne({ _id: id });
        return FromMongoData.One<InventoryNS.Transaction>(doc);
    }

    async CreateTransaction(ctx: ContextNS.Context, tranaction: InventoryNS.Transaction) {
        const session = MongoCommon.Session(ctx);
        const doc = ToMongoData.One(tranaction);
        await this.col_inventory_transaction.insertOne(doc, { session });
    }

    ///LOT
    async ListLot(warehouse_id: string, product_id: string) {
        const filter = {} as any;
        if (warehouse_id) {
            filter.warehouse_id = warehouse_id;
        }
        if (product_id) {
            filter.product_id = product_id
        }
        const docs = await this.col_inventory_lot.find(filter).toArray();
        return FromMongoData.Many<InventoryNS.Lot>(docs);
    }

    async GetLot(ctx: ContextNS.Context, id: string) {
        const session = MongoCommon.Session(ctx);
        const doc = await this.col_inventory_lot.findOne({ _id: id }, { session });
        return FromMongoData.One<InventoryNS.Lot>(doc);
    }

    async CreateLot(ctx: ContextNS.Context, lot: InventoryNS.Lot) {
        try {
            const session = MongoCommon.Session(ctx);
            const doc = ToMongoData.One(lot);
            await this.col_inventory_lot.insertOne(doc, { session });
        } catch (err) {
            if (err.code === MongoErrorCodes.Duplicate) {
                throw InventoryNS.Errors.ErrLotCodeExisted;
            } else {
                throw err;
            }
        }
    }

    async UpdateLot(ctx: ContextNS.Context, lot: InventoryNS.Lot) {
        const session = MongoCommon.Session(ctx);
        const doc = ToMongoData.One(lot);
        await this.col_inventory_lot.updateOne({ _id: lot.id }, { $set: doc }, { session });
    }

    async GetAllLot() {
        const docs = await this.col_inventory_lot.find().toArray();
        return FromMongoData.Many<InventoryNS.Lot>(docs);
    }
}