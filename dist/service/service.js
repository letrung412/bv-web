"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceNS = void 0;
const rand_1 = require("../lib/rand");
var ServiceNS;
(function (ServiceNS) {
    let Type;
    (function (Type) {
        Type["Exam"] = "exam";
        Type["Test"] = "test";
        Type["Ent"] = "ent";
        Type["Ultrasound"] = "ultrasound";
        Type["XRay"] = "x-ray";
        Type["Other"] = "other";
    })(Type = ServiceNS.Type || (ServiceNS.Type = {}));
    ServiceNS.Errors = {
        ErrServiceNotFound: new Error("service not found"),
        ErrServicePolicyNotFound: new Error("service policy not found"),
        ErrServiceStepNotFound: new Error("service step not found"),
    };
    ServiceNS.Generator = {
        NewServiceId: () => rand_1.default.uppercase(10),
        NewPolicyId: () => rand_1.default.uppercase(10),
        NewServiceStepId: () => rand_1.default.uppercase(12), // collision 2^30
    };
})(ServiceNS = exports.ServiceNS || (exports.ServiceNS = {}));
