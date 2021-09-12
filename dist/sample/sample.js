"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleNS = void 0;
const rand_1 = require("../lib/rand");
var SampleNS;
(function (SampleNS) {
    let Device;
    (function (Device) {
        Device["BS200E"] = "BS-200E";
        Device["UA66"] = "UA-66";
        Device["BC2800"] = "BC-2800";
        Device["Test"] = "Test";
        Device["Immune"] = "Immune";
        Device["Other"] = "Other";
    })(Device = SampleNS.Device || (SampleNS.Device = {}));
    SampleNS.Generator = {
        NewSampleId: () => rand_1.default.number(12)
    };
    SampleNS.Errors = {
        ErrSampleNotFound: new Error("Sample not found"),
        ErrSampleIdExisted: new Error("Sample ID Existed"),
        ErrMachineNotWorking: new Error("Machine not working sample")
    };
})(SampleNS = exports.SampleNS || (exports.SampleNS = {}));
//# sourceMappingURL=sample.js.map