"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryBLLBase = void 0;
const inventory_1 = require("./inventory");
const date_fns_1 = require("date-fns");
class InventoryBLLBase {
    constructor(dal, contextBLL, productBLL, orderBLL, retailBLL, jobBLL) {
        this.dal = dal;
        this.contextBLL = contextBLL;
        this.productBLL = productBLL;
        this.orderBLL = orderBLL;
        this.retailBLL = retailBLL;
        this.jobBLL = jobBLL;
    }
    async init() {
    }
    //  WAREHOUSE
    async ListWareHouse() {
        return this.dal.ListWareHouse();
    }
    async GetWareHouse(id) {
        const warehouse = await this.dal.GetWareHouse(id);
        if (!warehouse) {
            throw inventory_1.InventoryNS.Errors.ErrWareHouseNotFound;
        }
        return warehouse;
    }
    async UpdateWareHouse(id, params) {
        const warehouse = await this.GetWareHouse(id);
        if (params.name) {
            warehouse.name = params.name;
        }
        warehouse.mtime = Date.now();
        await this.dal.UpdateWareHouse(warehouse);
    }
    async CreateWareHouse(params) {
        const now = Date.now();
        const warehouse = {
            id: inventory_1.InventoryNS.Generator.NewWarehouseId(),
            name: params.name,
            ctime: now,
            mtime: now
        };
        await this.dal.CreateWareHouse(warehouse);
        return warehouse;
    }
    //TRANSACTION
    async ListTransaction(query) {
        return this.dal.ListTransaction(query);
    }
    async GetTransaction(id) {
        const transaction = await this.dal.GetTransaction(id);
        if (!transaction) {
            throw inventory_1.InventoryNS.Errors.ErrTransactionNotFound;
        }
        return transaction;
    }
    async CreateManyTransaction(ctx, params) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const transactions = await Promise.all(params.map(p => this.unsafeCreateOneTransaction(ctx, p)));
            return transactions;
        });
    }
    async CreateOneTransaction(ctx, params) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const transaction = await this.unsafeCreateOneTransaction(ctx, params);
            return transaction;
        });
    }
    async unsafeCreateOneTransaction(ctx, params) {
        const amount = +params.amount;
        // must be a non-zero number
        if (isNaN(amount) || Math.round(amount) != amount) {
            throw inventory_1.InventoryNS.Errors.ErrTransactionAmountLimit;
        }
        if (Math.abs(amount) > 1000) {
            throw inventory_1.InventoryNS.Errors.ErrTransactionAmountLimit;
        }
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const lot = await this.GetLot(ctx, params.lot_id);
            if (params.ref === "order") {
                await this.orderBLL.GetOrder(ctx, params.ref_id);
            }
            else if (params.ref === "lot") {
                // already check lot_id
            }
            else if (params.ref == "retail") {
                await this.retailBLL.GetOrder(ctx, params.ref_id);
            }
            else {
                throw inventory_1.InventoryNS.Errors.ErrTransactionRefNotAllowed;
            }
            const now = Date.now();
            switch (params.type) {
                case inventory_1.InventoryNS.TransactionType.LotChange:
                    lot.total += amount;
                    lot.remain += amount;
                    if (lot.remain < 0) {
                        throw inventory_1.InventoryNS.Errors.ErrInsufficientAmount;
                    }
                    break;
                case inventory_1.InventoryNS.TransactionType.LotRemain:
                    lot.remain += amount;
                    if (lot.remain < 0) {
                        throw inventory_1.InventoryNS.Errors.ErrInsufficientAmount;
                    }
                    break;
                case inventory_1.InventoryNS.TransactionType.LotTotal:
                    lot.total += amount;
                    break;
                default:
                    throw inventory_1.InventoryNS.Errors.ErrTransactionTypeNotAllowed;
            }
            lot.mtime = now;
            await this.dal.UpdateLot(ctx, lot);
            const transaction = {
                id: inventory_1.InventoryNS.Generator.NewWarehouseTransactionId(),
                ref: params.ref,
                ref_id: params.ref_id,
                type: params.type,
                amount: params.amount,
                product_id: lot.product_id,
                warehouse_id: lot.warehouse_id,
                created_by: params.created_by,
                lot_id: lot.id,
                ctime: now,
            };
            if (transaction.ref === "order") {
                await this.dal.CreateTransaction(ctx, transaction);
                const order = await this.orderBLL.GetOrder(ctx, params.ref_id);
                await this.jobBLL.FinishStep(ctx, order.ref_id, {
                    modified_by: params.created_by,
                    results: [{ "result": "done" }]
                });
                return transaction;
            }
            if (transaction.ref === "retail") {
                await this.dal.CreateTransaction(ctx, transaction);
                const order = await this.retailBLL.GetOrder(ctx, params.ref_id);
                await this.retailBLL.FinishOrder(ctx, order.id, {
                    ref_done: 'warehouse',
                    ref_done_id: transaction.warehouse_id
                });
                return transaction;
            }
        });
    }
    /// LOT
    async ListLot(warehouse_id, product_id) {
        return this.dal.ListLot(warehouse_id, product_id);
    }
    async GetLot(ctx, id) {
        const lot = await this.dal.GetLot(ctx, id);
        if (!lot) {
            throw inventory_1.InventoryNS.Errors.ErrLotNotFound;
        }
        return lot;
    }
    mustBeISODate(date) {
        if (isNaN(date_fns_1.parseISO(date).getTime())) {
            throw inventory_1.InventoryNS.Errors.ErrLotDate;
        }
    }
    async CreateLot(ctx, params) {
        await this.productBLL.GetProduct(params.product_id);
        await this.GetWareHouse(params.warehouse_id);
        this.mustBeISODate(params.man_date);
        this.mustBeISODate(params.exp_date);
        const now = Date.now();
        const lot = {
            id: inventory_1.InventoryNS.Generator.NewLotId(),
            code: params.code,
            product_id: params.product_id,
            warehouse_id: params.warehouse_id,
            total: 0,
            remain: 0,
            man_date: params.man_date,
            exp_date: params.exp_date,
            ctime: now,
            mtime: now,
        };
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            await this.dal.CreateLot(ctx, lot);
            await this.unsafeCreateOneTransaction(ctx, {
                type: inventory_1.InventoryNS.TransactionType.LotChange,
                amount: params.total,
                ref: "lot",
                ref_id: lot.id,
                lot_id: lot.id,
            });
            return this.GetLot(ctx, lot.id);
        });
    }
    async UpdateLot(ctx, id, params) {
        const lot = await this.GetLot(ctx, id);
        if (params.man_date) {
            this.mustBeISODate(params.man_date);
            lot.man_date = params.man_date;
        }
        if (params.exp_date) {
            this.mustBeISODate(params.exp_date);
            lot.exp_date = params.exp_date;
        }
        if (params.code) {
            lot.code = params.code;
        }
        await this.dal.UpdateLot(ctx, lot);
    }
    async GetAllLot() {
        return this.dal.GetAllLot();
    }
    async SearchProduct() {
        let viewProduct = [];
        let lots = await this.ListLot();
        let products = await this.productBLL.ListProduct();
        //FIND OLDEST LOT
        products.forEach(p => {
            let obj = p;
            const ONE_HUNDRED_YEARS = 1000 * 60 * 60 * 24 * 365 * 100;
            const now = Date.now();
            let min = now + ONE_HUNDRED_YEARS;
            let total_remain = 0;
            lots.forEach((l, i) => {
                if (p.id == l.product_id && l.remain > 0) {
                    total_remain += l.remain;
                    let exp_time = new Date(l.exp_date).getTime();
                    if (min > exp_time) {
                        min = exp_time;
                        Object.assign(l, { index: i });
                        //ADD INFO LOT INTO PRODUCT
                        Object.assign(obj, { oldestLot: l });
                        Object.assign(obj, { totalRemain: total_remain });
                    }
                }
            });
            viewProduct.push(obj);
        });
        return viewProduct;
    }
}
exports.InventoryBLLBase = InventoryBLLBase;
//# sourceMappingURL=inventory.bll.base.js.map