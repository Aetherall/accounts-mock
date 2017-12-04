"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
exports.toMongoID = function (objectId) {
    if (typeof objectId === 'string') {
        return new mongodb_1.ObjectID(objectId);
    }
    return objectId;
};
//# sourceMappingURL=toMongoId.js.map