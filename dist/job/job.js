"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobNS = void 0;
const rand_1 = require("../lib/rand");
const date_fns_1 = require("date-fns");
var JobNS;
(function (JobNS) {
    let StepStatus;
    (function (StepStatus) {
        StepStatus["New"] = "new";
        StepStatus["Ready"] = "ready";
        StepStatus["Running"] = "running";
        StepStatus["Cancel"] = "cancel";
        StepStatus["Done"] = "done";
    })(StepStatus = JobNS.StepStatus || (JobNS.StepStatus = {}));
    let StepType;
    (function (StepType) {
        StepType["Exam"] = "exam";
        StepType["Test"] = "test";
        StepType["Buy"] = "buy";
    })(StepType = JobNS.StepType || (JobNS.StepType = {}));
    JobNS.Errors = {
        ErrJobNotFound: new Error("job not found"),
        ErrJobRefNotAllowed: new Error("job ref not allowed"),
        ErrStepNotFound: new Error("job step not found"),
        ErrCancelStep: new Error("step can not cancel")
    };
    JobNS.Generator = {
        NewJobId: () => rand_1.default.alphabet(12),
        NewJobStepId: () => rand_1.default.alphabet(12),
        // step code sample [2004010830081238] has 16 numbers
        NewJobStepCode: () => `${date_fns_1.format(new Date(), "yyMMddhhmmssSSS")}${Math.floor(Math.random() * 10)}`,
    };
})(JobNS = exports.JobNS || (exports.JobNS = {}));
