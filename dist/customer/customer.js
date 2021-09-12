"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNS = void 0;
const date_fns_1 = require("date-fns");
const rand_1 = require("../lib/rand");
var CustomerNS;
(function (CustomerNS) {
    let Gender;
    (function (Gender) {
        Gender["Male"] = "male";
        Gender["Female"] = "female";
    })(Gender = CustomerNS.Gender || (CustomerNS.Gender = {}));
    let IDType;
    (function (IDType) {
        IDType["CMND"] = "cmnd";
        IDType["CCCD"] = "cccd";
    })(IDType = CustomerNS.IDType || (CustomerNS.IDType = {}));
    CustomerNS.Errors = {
        ErrCustomerNotFound: new Error("customer not found"),
        ErrCustomerCodeExisted: new Error("customer code existed"),
        ErrCustomerContactNotFound: new Error("customer contact not found"),
    };
    CustomerNS.Generator = {
        NewCustomerId: () => rand_1.default.uppercase(12),
        NewCustomerContactId: () => rand_1.default.alphabet(12),
        NewCustomerVisitId: () => rand_1.default.alphabet(16),
        NewCustomerCode: () => date_fns_1.format(new Date(), "yyMMddhhmmss"),
    };
})(CustomerNS = exports.CustomerNS || (exports.CustomerNS = {}));
