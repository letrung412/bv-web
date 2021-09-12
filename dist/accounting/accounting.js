"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingNS = void 0;
var AccountingNS;
(function (AccountingNS) {
    let BookStatus;
    (function (BookStatus) {
        BookStatus["Active"] = "active";
        BookStatus["Inactive"] = "inactive";
    })(BookStatus = AccountingNS.BookStatus || (AccountingNS.BookStatus = {}));
    let TransactionType;
    (function (TransactionType) {
        TransactionType["Cash"] = "cash";
        TransactionType["Other"] = "other";
    })(TransactionType = AccountingNS.TransactionType || (AccountingNS.TransactionType = {}));
    AccountingNS.Errors = {
        ErrBookNotFound: new Error("Book not found"),
        ErrTransactionRefNotAllowed: new Error("transaction ref not allowed"),
        ErrTransactionNotFound: new Error("Transaction not found"),
        ErrAmountMustBePositive: new Error("amount must be a positive number"),
        ErrOrderPriceAndTransactionAmount: new Error("Order price different transaction amount ")
    };
})(AccountingNS = exports.AccountingNS || (exports.AccountingNS = {}));
