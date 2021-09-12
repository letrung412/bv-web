"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryNS = void 0;
const rand_1 = require("../lib/rand");
var InventoryNS;
(function (InventoryNS) {
    let TransactionType;
    (function (TransactionType) {
        TransactionType["LotTotal"] = "lot_total";
        TransactionType["LotRemain"] = "lot_remain";
        TransactionType["LotChange"] = "lot_change";
    })(TransactionType = InventoryNS.TransactionType || (InventoryNS.TransactionType = {}));
    InventoryNS.Common = {
        MaxLotChange: 1000
    };
    InventoryNS.Errors = {
        ErrWareHouseNotFound: new Error("WareHouse not found"),
        ErrLotDate: new Error("Lot date invalid"),
        ErrLotCodeExisted: new Error("lot code existed for the current warehouse"),
        ErrLotNotFound: new Error("Lot not found"),
        ErrTransactionRefNotAllowed: new Error("transaction ref not allowed"),
        ErrTransactionNotFound: new Error("Transaction not found"),
        ErrTransactionAmountLimit: new Error(`transaction amount must be between 1 and ${InventoryNS.Common.MaxLotChange}`),
        ErrTransactionTypeNotAllowed: new Error(`transaction type not allowed`),
        ErrInsufficientAmount: new Error("Insuccicient amount"),
        ErrTransactionNotSupported: new Error("transaction not supported"),
    };
    InventoryNS.Generator = {
        NewWarehouseId: () => rand_1.default.uppercase(10),
        NewLotId: () => rand_1.default.alphabet(12),
        NewWarehouseTransactionId: () => rand_1.default.uppercase(16), // collision 2^48
    };
})(InventoryNS = exports.InventoryNS || (exports.InventoryNS = {}));
