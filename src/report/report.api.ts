import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import parse from "date-fns/parse";
import * as express from "express";
import { ReportNS } from "./report";

const valid_intervals = new Set(Object.values(ReportNS.Interval));

function GetTimeRange(query: any): {
    interval: ReportNS.Interval,
    time: [number, number]
} {
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
            min_time = subMonths(now, 12).getTime();
        } else {
            min_time = subDays(now, 30).getTime();
        }
    }
    
    max_time = new Date(max_time);
    // default max_time
    if (isNaN(max_time)) {
        max_time = endOfDay(now).getTime();
    }
    return { interval, time: [min_time, max_time] };
}

export function NewAPIReport(
    reportBLL: ReportNS.BLL
) {
    const app = express();
    app.get("/revenue", async (req, res) => {
        const group_by = req.query.group_by as any;
        const time_range = GetTimeRange(req.query);
        let docs = [];
        const input: ReportNS.Revenue.Input = {
            ...time_range,
        };
        if (group_by === "user") {
            docs = await reportBLL.RevenueByUser(input);
        } else {
            docs = await reportBLL.Revenue(input);
        }
        return res.json(docs);
    });
    return app;
}