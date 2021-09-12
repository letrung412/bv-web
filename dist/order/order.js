"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderNS = void 0;
const rand_1 = require("../lib/rand");
const date_fns_1 = require("date-fns");
var OrderNS;
(function (OrderNS) {
    let Status;
    (function (Status) {
        Status["New"] = "new";
        Status["Paid"] = "paid";
        Status["Done"] = "done";
    })(Status = OrderNS.Status || (OrderNS.Status = {}));
    let Type;
    (function (Type) {
        Type["OTCDrug"] = "otc_drug";
        Type["ETCDrug"] = "etc_drug";
        Type["Other"] = "other";
    })(Type = OrderNS.Type || (OrderNS.Type = {}));
    OrderNS.Errors = {
        ErrOrderNotFound: new Error("order not found"),
        ErrOrderRefNotAllowed: new Error("order ref not allowed"),
        ErrOrderDiscountNotAllowed: new Error("order discount not allowed"),
        ErrItemNotFound: new Error("order item not found"),
        ErrQuantityMustBePositive: new Error("quantity must be a positive number"),
        ErrOrderPaidNotEdit: new Error("only order new can update quantity"),
    };
    OrderNS.Generator = {
        NewOrderId: () => rand_1.default.alphabet(12),
        NewOrderItemId: () => rand_1.default.alphabet(12),
        NewRetailOrderCode: () => `${date_fns_1.format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`
    };
})(OrderNS = exports.OrderNS || (exports.OrderNS = {}));
//# sourceMappingURL=order.js.map