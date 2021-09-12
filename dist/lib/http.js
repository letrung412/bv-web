"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpParamValidators = exports.HttpBadRequest = exports.HttpNotFound = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, __httpStatusCode) {
        super(message);
        this.__httpStatusCode = __httpStatusCode;
    }
    HttpStatusCode() {
        return this.__httpStatusCode;
    }
}
exports.HttpError = HttpError;
function HttpNotFound(msg = 'not found') {
    return new HttpError(msg, 404 /* NotFound */);
}
exports.HttpNotFound = HttpNotFound;
function HttpBadRequest(msg = 'bad input') {
    return new HttpError(msg, 400 /* BadRequest */);
}
exports.HttpBadRequest = HttpBadRequest;
exports.HttpParamValidators = {
    MustBeString(obj, key, min = 1, max = 512) {
        const v = obj[key];
        if (typeof v !== 'string') {
            throw HttpBadRequest(`${key} must be string`);
        }
        if (v.length < min) {
            throw HttpBadRequest(`${key} must be at least ${min} characters`);
        }
        if (v.length > max) {
            throw HttpBadRequest(`${key} must be shorter than ${max} characters`);
        }
        return v;
    },
    MustBeOneOf(obj, key, values = []) {
        const value = obj[key];
        for (const v of values) {
            if (v === value) {
                return v;
            }
        }
        throw HttpBadRequest(`${key} must be one of ${values.join(',')}`);
    },
};
//# sourceMappingURL=http.js.map