"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
exports.getHashPassword = function (algorithm) { return function (password) {
    if (typeof password !== 'string')
        return password.digest;
    var hash = crypto.createHash(algorithm);
    hash.update(password);
    return hash.digest('hex');
}; };
//# sourceMappingURL=hashPassword.js.map