"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSecretBcrypt = exports.AuthSecretPlainText = void 0;
const bcrypt = require("bcryptjs");
class AuthSecretPlainText {
    constructor() {
        this.name = "";
    }
    async encode(plain) {
        return plain;
    }
    async compare(plain, secret) {
        return plain === secret;
    }
}
exports.AuthSecretPlainText = AuthSecretPlainText;
class AuthSecretBcrypt {
    constructor(salt = 10) {
        this.salt = salt;
        this.name = "bcrypt";
    }
    async encode(plain) {
        return bcrypt.hash(plain, this.salt);
    }
    async compare(plain, secret) {
        return bcrypt.compare(plain, secret);
    }
}
exports.AuthSecretBcrypt = AuthSecretBcrypt;
//# sourceMappingURL=auth.secret.js.map