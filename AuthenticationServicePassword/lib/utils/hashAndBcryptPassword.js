"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptPassword_1 = require("./bcryptPassword");
exports.getHashAndBcryptPassword = function (hashPasswordWithAlgorithm) { return function (password) {
    var hashedPassword = hashPasswordWithAlgorithm(password);
    return bcryptPassword_1.bcryptPassword(hashedPassword);
}; };
//# sourceMappingURL=hashAndBcryptPassword.js.map