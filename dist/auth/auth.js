"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthNS = void 0;
var UserAuthNS;
(function (UserAuthNS) {
    UserAuthNS.Errors = {
        ErrUserHasNoLogin: new Error("user has no login"),
        ErrWrongPassword: new Error("wrong password"),
    };
})(UserAuthNS = exports.UserAuthNS || (exports.UserAuthNS = {}));
