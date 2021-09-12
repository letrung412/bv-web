import { InventoryNS } from './inventory';
import { ContextNS } from '../ext/ctx';
import { ProductNS } from '../product/product';
import { parseISO } from 'date-fns';
import { OrderNS } from '../order/order';
import { JobNS } from '../job/job';
import { RetailNS } from '../retail/retail';

export class InventoryBLLBase implements InventoryNS.BLL {
    constructor(
        private dal: InventoryNS.DAL,
        private contextBLL: ContextNS.BLL,
        private productBLL: ProductNS.BLL,
        private orderBLL: OrderNS.BLL,
        private retailBLL : RetailNS.BLL,
        private jobBLL : JobNS.BLL
    ) {

    }

    async init() {

    }

    //  WAREHOUSE
    async ListWareHouse() {
        return this.dal.ListWareHouse();
    }
    async GetWareHouse(id: string) {
        const warehouse = await this.dal.GetWareHouse(id);
        if (!warehouse) {
            throw InventoryNS.Errors.ErrWareHouseNotFound;
        }
        return warehouse;
    }

    async UpdateWareHouse(id: string, params: InventoryNS.UpdateWareHouseParams) {
        const warehouse = await this.GetWareHouse(id);
        if (params.name) {
            warehouse.name = params.name;
        }
        warehouse.mtime = Date.now();
        await this.dal.UpdateWareHouse(warehouse);
    }

    async CreateWareHouse(params: InventoryNS.CreateWareHouseParams) {
        const now = Date.now();
        const warehouse: InventoryNS.WareHouse = {
            id: InventoryNS.Generator.NewWarehouseId(),
            name: params.name,
            ctime: now,
            mtime: now
        }
        await this.dal.CreateWareHouse(warehouse);
        return warehouse;
    }

    //TRANSACTION
    async ListTransaction(query: InventoryNS.QueryTransaction) {
        return this.dal.ListTransaction(query);
    }

    async GetTransaction(id: string) {
        const transaction = await this.dal.GetTransaction(id);
        if (!transaction) {
            throw InventoryNS.Errors.ErrTransactionNotFound;
        }
        return transaction;
    }

    async CreateManyTransaction(ctx: ContextNS.Context, params: InventoryNS.CreateTransactionParams[]) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const transactions = await Promise.all(
                params.map(p => this.unsafeCreateOneTransaction(ctx, p))
            );
            return transactions;
        });
    }

    async CreateOneTransaction(ctx: ContextNS.Context, params: InventoryNS.CreateTransactionParams) {
        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const transaction = await this.unsafeCreateOneTransaction(ctx, params);
            return transaction;
        })
    }
    async unsafeCreateOneTransaction(ctx: ContextNS.Context, params: InventoryNS.CreateTransactionParams) {
        const amount = +params.amount;
        // must be a non-zero number
        if (isNaN(amount) || Math.round(amount) != amount) {
            throw InventoryNS.Errors.ErrTransactionAmountLimit;
        }
        if (Math.abs(amount) > 1000) {
            throw InventoryNS.Errors.ErrTransactionAmountLimit;
        }

        return this.contextBLL.RunTransaction(ctx, async (ctx) => {
            const lot = await this.GetLot(ctx, params.lot_id);
            if (params.ref === "order") {
                await this.orderBLL.GetOrder(ctx, params.ref_id);
            } else if (params.ref === "lot") {
                // already check lot_id
            } else if (params.ref == "retail") {
                await this.retailBLL.GetOrder(ctx, params.ref_id);
            } else {
                throw InventoryNS.Errors.ErrTransactionRefNotAllowed;
            }
            const now = Date.now();
            switch (params.type) {
                case InventoryNS.TransactionType.LotChange:
                    lot.total += amount;
                    lot.remain += amount;
                    if (lot.remain < 0) {
                        throw InventoryNS.Errors.ErrInsufficientAmount;
                    }
                    break;
                case InventoryNS.TransactionType.LotRemain:
                    lot.remain += amount;
                    if (lot.remain < 0) {
                        throw InventoryNS.Errors.ErrInsufficientAmount;
                    }
                    break;
                case InventoryNS.TransactionType.LotTotal:
                    lot.total += amount;
                    break;
                default:
                    throw InventoryNS.Errors.ErrTransactionTypeNotAllowed;
            }
            lot.mtime = now;
            await this.dal.UpdateLot(ctx, lot);
            const transaction: InventoryNS.Transaction = {
                id: InventoryNS.Generator.NewWarehouseTransactionId(),
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
                    modified_by : params.created_by,
                    results : [{"result" : "done"}]
                })
                return transaction;
            }
            if (transaction.ref === "retail") {
                await this.dal.CreateTransaction(ctx, transaction);
                const order = await this.retailBLL.GetOrder(ctx, params.ref_id);
                await this.retailBLL.FinishOrder(ctx, order.id, {
                    ref_done : 'warehouse',
                    ref_done_id : transaction.warehouse_id
                })
                return transaction;
            }
        });
    }

    /// LOT
    async ListLot(warehouse_id?: string, product_id?: string) {       
        return this.dal.ListLot(warehouse_id, product_id);
    }
        
    async GetLot(ctx: ContextNS.Context, id: string) {
        const lot = await this.dal.GetLot(ctx, id);
        if (!lot) {
            throw InventoryNS.Errors.ErrLotNotFound;
        }
        return lot;
    }

    private mustBeISODate(date: string) {
        if (isNaN(parseISO(date).getTime())) {
            throw InventoryNS.Errors.ErrLotDate;
        }
    }

    async CreateLot(ctx: ContextNS.Context, params: InventoryNS.CreateLotParams) {
        await this.productBLL.GetProduct(params.product_id);
        await this.GetWareHouse(params.warehouse_id);
        this.mustBeISODate(params.man_date);
        this.mustBeISODate(params.exp_date);
        const now = Date.now();
        const lot: InventoryNS.Lot = {
            id: InventoryNS.Generator.NewLotId(),
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
                type: InventoryNS.TransactionType.LotChange,
                amount: params.total,
                ref: "lot",
                ref_id: lot.id,
                lot_id: lot.id,
            });
            return this.GetLot(ctx, lot.id);
        });
    }

    async UpdateLot(ctx: ContextNS.Context, id: string, params: InventoryNS.UpdateLotParams) {
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
            const ONE_HUNDRED_YEARS = 1000*60*60*24*365*100;
            const now = Date.now();
            let min = now + ONE_HUNDRED_YEARS;
            let total_remain = 0;
            lots.forEach((l, i) => {
                if(p.id == l.product_id && l.remain > 0){
                    total_remain+= l.remain;
                    let exp_time = new Date(l.exp_date).getTime();
                    if(min> exp_time){
                        min = exp_time;
                        Object.assign(l, {index: i})
                        //ADD INFO LOT INTO PRODUCT
                        Object.assign(obj, {oldestLot: l});
                        Object.assign(obj, {totalRemain: total_remain});
                    }
                }
            });
           
            viewProduct.push(obj);
        });
        return viewProduct;
    }
}