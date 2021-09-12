"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeRevuene = exports.DATA_FORM = void 0;
const ctx_1 = require("../ext/ctx");
const job_1 = require("../job/job");
const order_1 = require("../order/order");
const service_1 = require("../service/service");
const accounting_1 = require("./accounting");
const export_excel_1 = require("../lib/export_excel");
exports.DATA_FORM = {
    index: "STT",
    full_name: "Họ tên",
    phone: "SĐT",
    [service_1.ServiceNS.Type.Exam]: "Khám",
    [service_1.ServiceNS.Type.Test]: "XN",
    [service_1.ServiceNS.Type.XRay]: "XQ",
    [service_1.ServiceNS.Type.Ultrasound]: "S.Â",
    [service_1.ServiceNS.Type.Ent]: "NSTMH",
    emergency: "DV Khác",
    [accounting_1.AccountingNS.TransactionType.Cash]: "Tiền mặt",
    [accounting_1.AccountingNS.TransactionType.Other]: "ATM",
    [job_1.JobNS.StepStatus.Cancel]: "Hủy"
};
async function ComputeRevuene(docs, jobBLL) {
    const ctx = ctx_1.ContextNS.New();
    let data = [];
    let revuene = { [job_1.JobNS.StepType.Exam]: 0, [order_1.OrderNS.Type.OTCDrug]: 0, [service_1.ServiceNS.Type.Ent]: 0,
        [service_1.ServiceNS.Type.Ultrasound]: 0, [service_1.ServiceNS.Type.XRay]: 0, [service_1.ServiceNS.Type.Test]: 0, [service_1.ServiceNS.Type.Other]: 0, ["retail"]: 0,
        [accounting_1.AccountingNS.TransactionType.Cash]: 0, ["atm"]: 0, [job_1.JobNS.StepStatus.Cancel]: 0
    };
    const transactions = await Promise.all(docs.map(async (doc, index) => {
        let obj = {
            [exports.DATA_FORM.index]: `${index + 1}`,
            [exports.DATA_FORM.full_name]: doc["order"].customer.full_name,
            [exports.DATA_FORM.phone]: doc["order"].customer.contacts[0].phone,
            [exports.DATA_FORM.exam]: 0,
            [exports.DATA_FORM.test]: 0,
            [exports.DATA_FORM["x-ray"]]: 0,
            [exports.DATA_FORM.ultrasound]: 0,
            [exports.DATA_FORM.ent]: 0,
            [exports.DATA_FORM.emergency]: 0,
            [exports.DATA_FORM.cash]: 0,
            [exports.DATA_FORM.other]: 0,
            [exports.DATA_FORM.cancel]: 0
        };
        if (doc.ref == "order") {
            const job_step = await jobBLL.GetStep(ctx, doc["order"].ref_id);
            if (job_step.status !== job_1.JobNS.StepStatus.Cancel) {
                if (job_step.type === job_1.JobNS.StepType.Exam) {
                    revuene[job_1.JobNS.StepType.Exam] += doc.amount;
                    obj[exports.DATA_FORM.exam] = doc.amount;
                }
                else if (job_step.type === job_1.JobNS.StepType.Buy) {
                    revuene[order_1.OrderNS.Type.OTCDrug] += doc.amount;
                }
                else if (job_step.type === job_1.JobNS.StepType.Test) {
                    if (job_step.order.items[0].ref_value["type"] == service_1.ServiceNS.Type.Ent) {
                        revuene[service_1.ServiceNS.Type.Ent] += doc.amount;
                        obj[exports.DATA_FORM.ent] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == service_1.ServiceNS.Type.Ultrasound) {
                        revuene[service_1.ServiceNS.Type.Ultrasound] += doc.amount;
                        obj[exports.DATA_FORM.ultrasound] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == service_1.ServiceNS.Type.XRay) {
                        revuene[service_1.ServiceNS.Type.XRay] += doc.amount;
                        obj[exports.DATA_FORM["x-ray"]] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == service_1.ServiceNS.Type.Test) {
                        revuene[service_1.ServiceNS.Type.Test] += doc.amount;
                        obj[exports.DATA_FORM.test] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == service_1.ServiceNS.Type.Other) {
                        revuene[service_1.ServiceNS.Type.Other] += doc.amount;
                        obj[exports.DATA_FORM.emergency] = doc.amount;
                    }
                }
                if (doc.type == accounting_1.AccountingNS.TransactionType.Cash) {
                    revuene[accounting_1.AccountingNS.TransactionType.Cash] += doc.amount;
                    obj[exports.DATA_FORM.cash] = doc.amount;
                }
                if (doc.type == accounting_1.AccountingNS.TransactionType.Other) {
                    revuene["atm"] += doc.amount;
                    obj[exports.DATA_FORM.other] = doc.amount;
                }
            }
            else {
                revuene[job_1.JobNS.StepStatus.Cancel] += doc.amount;
                obj[exports.DATA_FORM.cancel] = doc.amount;
            }
            data.push(obj);
            delete job_step["location"];
            delete job_step["order"];
            delete job_step["results"];
            return { ...doc, job_step };
        }
        revuene["retail"] += doc.amount;
    }));
    data.sort((a, b) => parseInt(a["STT"]) - parseInt(b["STT"]));
    // Excel colA - colK
    const total = {
        [exports.DATA_FORM.index]: "",
        [exports.DATA_FORM.full_name]: "",
        [exports.DATA_FORM.phone]: "Tổng từng dv",
        [exports.DATA_FORM.exam]: revuene[job_1.JobNS.StepType.Exam],
        [exports.DATA_FORM.test]: revuene[service_1.ServiceNS.Type.Test],
        [exports.DATA_FORM["x-ray"]]: revuene[service_1.ServiceNS.Type.XRay],
        [exports.DATA_FORM.ultrasound]: revuene[service_1.ServiceNS.Type.Ultrasound],
        [exports.DATA_FORM.ent]: revuene[service_1.ServiceNS.Type.Ent],
        [exports.DATA_FORM.emergency]: revuene[service_1.ServiceNS.Type.Other],
        [exports.DATA_FORM.cash]: revuene[accounting_1.AccountingNS.TransactionType.Cash],
        [exports.DATA_FORM.other]: revuene["atm"],
        [exports.DATA_FORM.cancel]: revuene[job_1.JobNS.StepStatus.Cancel]
    };
    const money = revuene[accounting_1.AccountingNS.TransactionType.Cash] + revuene["atm"] - revuene[job_1.JobNS.StepStatus.Cancel];
    const money_back = revuene[accounting_1.AccountingNS.TransactionType.Cash] - revuene["atm"] - revuene[job_1.JobNS.StepStatus.Cancel];
    const transaction_type = {
        [exports.DATA_FORM.index]: `Tiền mặt = ${revuene[accounting_1.AccountingNS.TransactionType.Cash]}`,
        [exports.DATA_FORM.exam]: `ATM = ${revuene["atm"]}`,
        [exports.DATA_FORM.ultrasound]: `HĐ Hủy = ${revuene[job_1.JobNS.StepStatus.Cancel]}`,
    };
    const total_amount = {
        [exports.DATA_FORM.index]: `Tổng tiền thu = ${money}`,
    };
    const amount = {
        [exports.DATA_FORM.index]: `Tổng tiền phải nộp = ${money_back}`,
    };
    const date = new Date().toLocaleDateString("en-gb", { day: "2-digit", month: "2-digit", year: "numeric" });
    const array_date = date.split("/");
    const date_info = {
        [exports.DATA_FORM.index]: `Bằng chữ : ${export_excel_1.moneyToWord(money_back)}`,
        [exports.DATA_FORM.ent]: `Bắc Ninh, Ngày ${array_date[0]} Tháng ${array_date[1]} Năm ${array_date[2]}`,
    };
    const user_name = {
        [exports.DATA_FORM.full_name]: "Kế toán thu ngân",
        [exports.DATA_FORM.emergency]: "Thủ quỹ"
    };
    const info = {
        [exports.DATA_FORM.full_name]: "(ký và ghi rõ họ tên)",
        [exports.DATA_FORM.emergency]: "(ký và ghi rõ họ tên)"
    };
    const space_row = {};
    const footer = [total, transaction_type, total_amount, amount, date_info, user_name, info, space_row, space_row];
    data.push(...footer);
    return { revuene, data, transactions };
}
exports.ComputeRevuene = ComputeRevuene;
