import * as express from "express";
import { HttpParamValidators } from "../lib/http";
import { RegionNS } from "./region";

export function NewAPIRegion(
    regionBLL : RegionNS.BLL
) {
    const app = express();
    const type_regions = Object.values(RegionNS.Type);
    app.get("/region/list" , async (req,res) => {
        const type = HttpParamValidators.MustBeOneOf(req.query, "type" , type_regions)
        const parent_id = HttpParamValidators.MustBeString(req.query, "parent_id");
        const querry : RegionNS.QuerryRegionParams = {
            type,
            parent_id
        }
        const docs = await regionBLL.ListRegion(querry);
        docs.sort((a,b) => {
            if (a.name == "Tỉnh Bắc Ninh") {
                return -1;
            } else if (a.name == "Thành phố Hà Nội") {
                return -1;
            }
            return a.name.localeCompare(a.name);
        })
        res.json(docs);
    })

    app.get("/region/get" , async (req,res) => {
        if (req.query.id) {
            const id = req.query.id as string;
            const doc = await regionBLL.GetRegion(id);
            res.json(doc);
        }
        if (req.query.name) {
            const name = req.query.name as string;
            const doc = await regionBLL.GetRegionByName(name);
            res.json(doc);
        }
    })

    app.post('/region/create' , async (req,res) => {
        const type = HttpParamValidators.MustBeOneOf(req.body, "type" , type_regions);
        const name = HttpParamValidators.MustBeString(req.body, "name");
        const parent_id = HttpParamValidators.MustBeString(req.body, "parent_id")
        const zip_code = HttpParamValidators.MustBeString(req.body, "zip_code");
        const params : RegionNS.CreateRegionParams = {
            zip_code,
            name,
            type,
            parent_id
        }
        const doc = await regionBLL.CreateRegion(params);
        res.json(doc);
    })

    return app;
}