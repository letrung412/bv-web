"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetailNS = void 0;
const rand_1 = require("../lib/rand");
const date_fns_1 = require("date-fns");
var RetailNS;
(function (RetailNS) {
    let Status;
    (function (Status) {
        Status["New"] = "new";
        Status["Paid"] = "paid";
        Status["Done"] = "done";
    })(Status = RetailNS.Status || (RetailNS.Status = {}));
    RetailNS.Errors = {
        ErrOrderNotFound: new Error("order not found"),
        ErrOrderRefNotAllowed: new Error("order ref not allowed"),
        ErrItemNotFound: new Error("order item not found"),
    };
    RetailNS.Generator = {
        NewOrderId: () => rand_1.default.alphabet(12),
        NewOrderItemId: () => rand_1.default.alphabet(12),
        NewOrderCode: () => `${date_fns_1.format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`
    };
})(RetailNS = exports.RetailNS || (exports.RetailNS = {}));
//# sourceMappingURL=retail.js.map