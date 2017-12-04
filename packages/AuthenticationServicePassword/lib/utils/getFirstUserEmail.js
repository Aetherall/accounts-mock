"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstUserEmail = function (user, address) {
    if (!address && user.emails && user.emails[0]) {
        address = user.emails[0].address;
    }
    if (!address)
        throw new Error('No such email address for user');
    var userEmailRecords = user.emails || [];
    var userEmails = userEmailRecords.map(function (email) { return email.address; });
    var doAddressBelongsToUser = userEmails.includes(address);
    if (!doAddressBelongsToUser)
        throw new Error('The address does not belongs to the user');
    return address;
};
//# sourceMappingURL=getFirstUserEmail.js.map