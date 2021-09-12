"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportDALMongo = void 0;
const report_1 = require("./report");
const TimeFormats = {
    [report_1.ReportNS.Interval.Month]: "%Y-%m",
    [report_1.ReportNS.Interval.Day]: "%Y-%m-%d",
};
function GroupByTime(field, interval) {
    return {
        $dateToString: {
            date: { $toDate: '$ctime' },
            format: TimeFormats[interval],
        }
    };
}
class ReportDALMongo {
    constructor(db) {
        this.db = db;
        this.col_accounting_transaction = this.db.collection("accounting_transaction");
    }
    async init() { }
    async Revenue(input) {
        const [min, max] = input.time;
        const $match = { ctime: { $gte: min, $lte: max } };
        const $group = {
            _id: GroupByTime("$ctime", input.interval),
            amount: { $sum: '$amount' }
        };
        const docs = await this.col_accounting_transaction.aggregate([
            { $match },
            { $group },
            {
                $project: {
                    _id: 0,
                    time: "$_id",
                    amount: "$amount"
                }
            },
        ]).toArray();
        return docs;
    }
    async RevenueByUser(input) {
        const [min, max] = input.time;
        const $match = { ctime: { $gte: min, $lte: max } };
        const $group = {
            _id: {
                time: GroupByTime("$ctime", input.interval),
                user_id: '$create_by',
            },
            amount: { $sum: '$amount' }
        };
        const docs = await this.col_accounting_transaction.aggregate([
            { $match },
            { $group },
            {
                $project: {
                    _id: 0,
                    time: "$_id.time",
                    user_id: "$_id.user_id",
                    amount: "$amount",
                }
            },
        ]).toArray();
        return docs;
    }
}
exports.ReportDALMongo = ReportDALMongo;
