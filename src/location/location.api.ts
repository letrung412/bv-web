import * as express from 'express';
import { HttpError, HttpStatusCodes, HttpParamValidators } from '../lib/http';
import { LocationNS } from './location';
import { UserAuthNS } from '../auth/auth';

export function NewLocationAPI(
  userAuthBLL: UserAuthNS.BLL,
  locationBLL: LocationNS.BLL,
) {
    const app = express();
    //ADD NEW LOCATION
    app.post("/create", async (req, res) => {
        const location_type = HttpParamValidators.MustBeString(req.body, 'location_type', 2);
        const name = HttpParamValidators.MustBeString(req.body, 'name', 2);
        const code = HttpParamValidators.MustBeString(req.body, 'code', 2);
        const params: LocationNS.CreateLocationParams = {
            type: location_type,
            name,
            code,
        };
        const location = await locationBLL.CreateLocation(params);
        res.json(location);
    });

    //GET LIST
    app.get("/list", async (req, res) => {
        const docs = await locationBLL.ListLocation();
        res.json(docs);
    });

    app.get("/listtype", async (req, res) => {
        const docs = await locationBLL.ListLocationOfType(req.query.type as string);
        res.json(docs);
    })

    //UPDATE LOCATION
    app.post("/update", async (req, res) => {
        const id = HttpParamValidators.MustBeString(req.body, 'id');
        const code = req.body.code;
        const name = req.body.name;
        const location_type = req.body.location_type;
        const params: LocationNS.UpdateLocationParams = {
            type: location_type,
            code,
            name,
        };
        await locationBLL.UpdateLocation(id, params);
        res.json(1);
    });

    //GET ONE LOCATION
    app.get("/get", async (req, res) => {
        const doc = await locationBLL.GetLocation(req.query.id as string);
        res.json(doc);
    });

    //DELETE
    app.post("/delete", async (req, res) => {
        const doc = await locationBLL.DeleteLocation(req.body.id as string);
        res.json(doc);
    });

    //ADD NEW TYPE
    app.post("/type/create", async (req, res) => {
        const name = HttpParamValidators.MustBeString(req.body, 'name', 2);
        const code = HttpParamValidators.MustBeString(req.body, 'code', 2);
        const params: LocationNS.CreateTypeParams = {
            name,
            code,
        };
        const location_type = await locationBLL.CreateType(params);
        res.json(location_type);
    });

    //GET LIST
    app.get("/type/list", async (req, res) => {
        const docs = await locationBLL.ListType();
        res.json(docs);
    });

    //UPDATE TYPE
    app.post("/type/update", async (req, res) => {
        const id = HttpParamValidators.MustBeString(req.body, 'id');
        const code = req.body.code;
        const name = req.body.name;
        const params: LocationNS.UpdateTypeParams = {
            code,
            name,
        };
        await locationBLL.UpdateType(id, params);
        res.json(1);
    });

    //GET ONE TYPE
    app.get("/type/get", async (req, res) => {
        const doc = await locationBLL.GetType(req.query.id as string);
        res.json(doc);
    });

    //DELETE
    app.post("/type/delete", async (req, res) => {
        const doc = await locationBLL.DeleteType(req.body.id as string);
        res.json(doc);
    });

    //LOCATION_SERVICE
    app.post("/service/add", async (req, res) => {
        const location_id = HttpParamValidators.MustBeString(req.body, 'location_id', 2);
        const service_id = HttpParamValidators.MustBeString(req.body, 'service_id', 2);
        const doc = await locationBLL.AddService(location_id, service_id);
        res.json(doc);
    });

    app.post("/service/remove", async (req, res) => {
        const location_id = req.body.location_id.toString();
        const service_id = req.body.service_id.toString();
        const doc = await locationBLL.RemoveService(location_id, service_id);
        res.json(1);
    });

    app.get("/service/list", async (req, res) => {
        const location_id = req.query.id.toString();
        const docs = await locationBLL.ListService(location_id);
        res.json(docs);
    });

    app.get("/service/location", async (req, res) => {
        const service_id = req.query.id as string;
        const docs = await locationBLL.ListLocationByService(service_id);
        res.json(docs);
    })

    const commonErrors = new Set([
        ...Object.values(LocationNS.Errors),
    ]);

    app.use((err: Error, req, res, next) => {
        if (commonErrors.has(err)) {
            err = new HttpError(err.message, HttpStatusCodes.BadRequest);
        }
        next(err);
    });

    return app;
}
