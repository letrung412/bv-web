"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAPIReport = void 0;
const date_fns_1 = require("date-fns");
const express = require("express");
const report_1 = require("./report");
const valid_intervals = new Set(Object.values(report_1.ReportNS.Interval));
function GetTimeRange(query) {
    const now = new Date();
    let { interval, min_time, max_time } = query;
    console.log(query);
    // default interval
    if (!valid_intervals.has(interval)) {
        interval = "day";
    }
    min_time = new Date(min_time);
    // default min_time 
    if (isNaN(min_time)) {
        if (interval === "month") {
            min_time = date_fns_1.subMonths(now, 12).getTime();
        }
        else {
            min_time = date_fns_1.subDays(now, 30).getTime();
        }
    }
    max_time = new Date(max_time);
    // default max_time
    if (isNaN(max_time)) {
        max_time = date_fns_1.endOfDay(now).getTime();
    }
    return { interval, time: [min_time, max_time] };
}
function NewAPIReport(reportBLL) {
    const app = express();
    app.get("/revenue", async (req, res) => {
        const group_by = req.query.group_by;
        const time_range = GetTimeRange(req.query);
        let docs = [];
        const input = {
            ...time_range,
        };
        if (group_by === "user") {
            docs = await reportBLL.RevenueByUser(input);
        }
        else {
            docs = await reportBLL.Revenue(input);
        }
        return res.json(docs);
    });
    return app;
}
exports.NewAPIReport = NewAPIReport;
//# sourceMappingURL=report.api.js.map