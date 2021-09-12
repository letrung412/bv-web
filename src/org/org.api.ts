import * as express from "express";
import { HttpError, HttpStatusCodes, HttpParamValidators } from "../lib/http";
import { OrgNS } from "./org";
import { UserAuthNS } from "../auth/auth";

export function NewOrgAPI(
  userAuthBLL: UserAuthNS.BLL,
  orgBLL: OrgNS.BLL,
) {
  const app = express();
  const roleType = Object.values(OrgNS.Role);
  const gender = Object.values(OrgNS.Gender);

  app.get("/org/list", async (req, res) => {
    const docs = await orgBLL.ListOrg();
    res.json(docs);
  });

  app.post("/org/create", async (req, res) => {
    const params: OrgNS.CreateOrgParams = {
      name : HttpParamValidators.MustBeString(req.body, "name", 2),
    };
    const doc = await orgBLL.CreateOrg(params);
    res.json(doc);
  });

  app.get("/user/list", async (req, res) => {
    const docs = await orgBLL.ListUser();
    res.json(docs);
  });

  app.get("/user/get", async (req, res) => {
    let doc = {} as any;
    if (req.query.id) {
      const id = HttpParamValidators.MustBeString(req.query, "id", 8);
      doc = await orgBLL.GetUser(id);
      res.json(doc);
    }

    if (req.query.username) {
      const username = HttpParamValidators.MustBeString(req.query, "username", 2);
      doc = await orgBLL.GetUserByUsername(username);
      res.json(doc);
    }
  });

  app.post("/user/create", async (req, res) => {
    const roles : OrgNS.Role[] = Array.from(new Set(req.body.roles));
    const params: OrgNS.CreateUserParams = {
      username : HttpParamValidators.MustBeString(req.body, "username", 2),
      org_id : HttpParamValidators.MustBeString(req.body, "org_id", 8),
      full_name : HttpParamValidators.MustBeString(req.body,"full_name", 2),
      roles : roles,
      gender : HttpParamValidators.MustBeOneOf(req.body, "gender", gender),
      phone : HttpParamValidators.MustBeString(req.body, "phone", 10),
      birthday : req.body.birthday,
    };
    const user = await orgBLL.CreateUser(params);
    res.json(user);
  });
  
  app.post("/user/update", async (req, res) => {
    const id = HttpParamValidators.MustBeString(req.query, "id");
    const roles : OrgNS.Role[] = Array.from(new Set(req.body.roles));
    const params: OrgNS.UpdateUserParams = {};
    if (req.body.full_name) {
      params.full_name = HttpParamValidators.MustBeString(req.body, "full_name", 2);
    }
    if (req.body.phone) {
      params.phone = HttpParamValidators.MustBeString(req.body, "phone", 10);
    }
    if (req.body.birthday) {
      params.birthday = HttpParamValidators.MustBeString(req.body, "birthday", 1);
    }
    if (req.body.roles) {
      params.roles = Array.from(roles);
      await userAuthBLL.DisableSession(id);
    }
    if (req.body.gender) {
      params.gender = req.body.gender;
    }
    await orgBLL.UpdateUser(id, params);
    res.json(1);
  });

  app.post("/user/delete", async (req, res) => {
    const user_id = HttpParamValidators.MustBeString(req.query, "id", 8);
    await orgBLL.DeleteUser(user_id as string);
    res.json(1);
  });
  return app;
}
