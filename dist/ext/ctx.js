"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextNS = void 0;
var ContextNS;
(function (ContextNS) {
    function New() {
        return {};
    }
    ContextNS.New = New;
    function WithContext(ctx, key, value) {
        return { ...ctx, [key]: value };
    }
    ContextNS.WithContext = WithContext;
    function FromContext(ctx, key) {
        return ctx[key];
    }
    ContextNS.FromContext = FromContext;
})(ContextNS = exports.ContextNS || (exports.ContextNS = {}));
