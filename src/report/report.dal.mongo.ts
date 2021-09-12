import { MongoDB } from "../lib/mongodb";
import { ReportNS } from "./report";

const TimeFormats = {
    [ReportNS.Interval.Month]: "%Y-%m",
    [ReportNS.Interval.Day]: "%Y-%m-%d",
}

function GroupByTime(field: string, interval: ReportNS.Interval) {
    return {
        $dateToString: {
            date: { $toDate: '$ctime' },
            format: TimeFormats[interval],
        }
    };
}

export class ReportDALMongo implements ReportNS.DAL {
    constructor(private db: MongoDB) { }

    async init() { }

    private col_accounting_transaction = this.db.collection("accounting_transaction");

    async Revenue(input: ReportNS.Revenue.Input) {
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

    async RevenueByUser(input: ReportNS.Revenue.InputByUser) {
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