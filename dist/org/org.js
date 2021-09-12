"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgNS = void 0;
const rand_1 = require("../lib/rand");
var OrgNS;
(function (OrgNS) {
    let Role;
    (function (Role) {
        Role["ADMIN"] = "admin";
        Role["BacSi"] = "bac_si";
        Role["LeTan"] = "le_tan";
        Role["ThuNgan"] = "thu_ngan";
        Role["DuocSi"] = "duoc_si";
        Role["KTV"] = "ki_thuat";
        Role["DieuDuong"] = "dieu_duong";
        Role["XQquang"] = "x_quang";
        Role["SieuAm"] = "sieu_am";
        Role["NoiSoi"] = "noi_soi";
        Role["Kho"] = "kho";
    })(Role = OrgNS.Role || (OrgNS.Role = {}));
    let Gender;
    (function (Gender) {
        Gender["Male"] = "male";
        Gender["Female"] = "female";
    })(Gender = OrgNS.Gender || (OrgNS.Gender = {}));
    OrgNS.Errors = {
        ErrUserNotFound: new Error("Username not found"),
        ErrUsernameExisted: new Error("Username existed"),
    };
    OrgNS.Generator = {
        NewOrgId: () => rand_1.default.uppercase(8),
        NewUserId: () => rand_1.default.uppercase(12), // collision 2^30
    };
})(OrgNS = exports.OrgNS || (exports.OrgNS = {}));
