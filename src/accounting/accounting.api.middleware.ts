import { ContextNS } from "../ext/ctx";
import { JobNS } from "../job/job";
import { OrderNS } from "../order/order";
import { ServiceNS } from "../service/service";
import { AccountingNS } from "./accounting";
import { moneyToWord } from "../lib/export_excel";

export const DATA_FORM = {
    index : "STT",
    full_name : "Họ tên",
    phone : "SĐT",
    [ServiceNS.Type.Exam] : "Khám",
    [ServiceNS.Type.Test] : "XN",
    [ServiceNS.Type.XRay] : "XQ",
    [ServiceNS.Type.Ultrasound] : "S.Â",
    [ServiceNS.Type.Ent] : "NSTMH",
    emergency : "DV Khác",
    [AccountingNS.TransactionType.Cash] : "Tiền mặt",
    [AccountingNS.TransactionType.Other] : "ATM",
    [JobNS.StepStatus.Cancel] : "Hủy"
}

export async function ComputeRevuene(docs: Array<AccountingNS.Transaction> , jobBLL : JobNS.BLL) {
    const ctx = ContextNS.New();
    let data = [];
    let revuene = {[JobNS.StepType.Exam] : 0,[OrderNS.Type.OTCDrug] : 0, [ServiceNS.Type.Ent] : 0,
        [ServiceNS.Type.Ultrasound] : 0 ,[ServiceNS.Type.XRay] : 0, [ServiceNS.Type.Test] : 0, [ServiceNS.Type.Other] : 0 ,["retail"]: 0,
        [AccountingNS.TransactionType.Cash] : 0, ["atm"] : 0, [JobNS.StepStatus.Cancel] : 0
    };
    const transactions = await Promise.all(docs.map(async (doc,index) => {
        let obj = {
            [DATA_FORM.index] : `${index + 1}`,
            [DATA_FORM.full_name] : doc["order"].customer.full_name,
            [DATA_FORM.phone] : doc["order"].customer.contacts[0].phone,
            [DATA_FORM.exam] : 0,
            [DATA_FORM.test] : 0,
            [DATA_FORM["x-ray"]] : 0,
            [DATA_FORM.ultrasound] : 0,
            [DATA_FORM.ent] : 0,
            [DATA_FORM.emergency] : 0,
            [DATA_FORM.cash] : 0,
            [DATA_FORM.other] : 0,
            [DATA_FORM.cancel] : 0
        }
        if (doc.ref == "order") { 
            const job_step = await jobBLL.GetStep(ctx, doc["order"].ref_id);
            if (job_step.status !== JobNS.StepStatus.Cancel) {
                if (job_step.type === JobNS.StepType.Exam) {
                    revuene[JobNS.StepType.Exam] += doc.amount;
                    obj[DATA_FORM.exam] = doc.amount;
                } else if (job_step.type === JobNS.StepType.Buy) {
                    revuene[OrderNS.Type.OTCDrug] += doc.amount;
                } else if (job_step.type === JobNS.StepType.Test) {
                    if (job_step.order.items[0].ref_value["type"] == ServiceNS.Type.Ent) {
                        revuene[ServiceNS.Type.Ent] += doc.amount;
                        obj[DATA_FORM.ent] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == ServiceNS.Type.Ultrasound) {
                        revuene[ServiceNS.Type.Ultrasound] += doc.amount;
                        obj[DATA_FORM.ultrasound] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == ServiceNS.Type.XRay) {
                        revuene[ServiceNS.Type.XRay] += doc.amount;
                        obj[DATA_FORM["x-ray"]] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == ServiceNS.Type.Test) {
                        revuene[ServiceNS.Type.Test] += doc.amount;
                        obj[DATA_FORM.test] = doc.amount;
                    }
                    if (job_step.order.items[0].ref_value["type"] == ServiceNS.Type.Other) {
                        revuene[ServiceNS.Type.Other] += doc.amount;
                        obj[DATA_FORM.emergency] = doc.amount;
                    }
                }
                if (doc.type == AccountingNS.TransactionType.Cash) {
                    revuene[AccountingNS.TransactionType.Cash] += doc.amount;
                    obj[DATA_FORM.cash] = doc.amount;
                }
                if (doc.type == AccountingNS.TransactionType.Other) {
                    revuene["atm"] += doc.amount;
                    obj[DATA_FORM.other] = doc.amount;
                }
            } else {
                revuene[JobNS.StepStatus.Cancel] += doc.amount;
                obj[DATA_FORM.cancel] = doc.amount;
            }
            data.push(obj);
            delete job_step["location"];
            delete job_step["order"];
            delete job_step["results"];
            return { ...doc, job_step };
        }
        revuene["retail"] += doc.amount;
    }))
    data.sort((a,b) => parseInt(a["STT"]) - parseInt(b["STT"]));
    // Excel colA - colK
    const total = {
        [DATA_FORM.index] : "",
        [DATA_FORM.full_name] : "",
        [DATA_FORM.phone] : "Tổng từng dv",
        [DATA_FORM.exam] : revuene[JobNS.StepType.Exam],
        [DATA_FORM.test] : revuene[ServiceNS.Type.Test],
        [DATA_FORM["x-ray"]] : revuene[ServiceNS.Type.XRay],
        [DATA_FORM.ultrasound] : revuene[ServiceNS.Type.Ultrasound],
        [DATA_FORM.ent] : revuene[ServiceNS.Type.Ent],
        [DATA_FORM.emergency] : revuene[ServiceNS.Type.Other],
        [DATA_FORM.cash] : revuene[AccountingNS.TransactionType.Cash],
        [DATA_FORM.other] : revuene["atm"],
        [DATA_FORM.cancel] : revuene[JobNS.StepStatus.Cancel]
    }

    const money = revuene[AccountingNS.TransactionType.Cash] + revuene["atm"] - revuene[JobNS.StepStatus.Cancel];
    const money_back = revuene[AccountingNS.TransactionType.Cash] - revuene["atm"] - revuene[JobNS.StepStatus.Cancel];
    const transaction_type = {
        [DATA_FORM.index] : `Tiền mặt = ${revuene[AccountingNS.TransactionType.Cash]}`,
        [DATA_FORM.exam] : `ATM = ${revuene["atm"]}`,
        [DATA_FORM.ultrasound] : `HĐ Hủy = ${revuene[JobNS.StepStatus.Cancel]}`,
    }
    const total_amount = {
        [DATA_FORM.index] : `Tổng tiền thu = ${money}`,
    }
    const amount = {
        [DATA_FORM.index] : `Tổng tiền phải nộp = ${money_back}`,
    }
    const date = new Date().toLocaleDateString("en-gb" , { day : "2-digit", month : "2-digit", year : "numeric"});
    const array_date = date.split("/");
    const date_info = {
        [DATA_FORM.index] : `Bằng chữ : ${moneyToWord(money_back)}`,
        [DATA_FORM.ent] : `Bắc Ninh, Ngày ${array_date[0]} Tháng ${array_date[1]} Năm ${array_date[2]}`,
    }
    const user_name = {
        [DATA_FORM.full_name] : "Kế toán thu ngân",
        [DATA_FORM.emergency] : "Thủ quỹ"
    }
    const info = {
        [DATA_FORM.full_name] : "(ký và ghi rõ họ tên)",
        [DATA_FORM.emergency]: "(ký và ghi rõ họ tên)"
    }
    const space_row = {};
    const footer = [total, transaction_type , total_amount, amount, date_info, user_name, info, space_row, space_row];
    data.push(...footer);
    return { revuene , data , transactions};
}
