"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var defaultConfig = {
    from: null
};
var NotificationEmailPluginPassword = (function () {
    function NotificationEmailPluginPassword(config) {
        var _this = this;
        this.name = 'password';
        this.enroll = function (send) { return function (_a) {
            var address = _a.address, user = _a.user, token = _a.token;
            var mail = {
                from: _this.from,
                to: address,
                subject: 'Set your password',
                text: "To set your password please click on this link: " + token
            };
            send(mail);
        }; };
        this.resetPassword = function (send) { return function (_a) {
            var address = _a.address, user = _a.user, token = _a.token;
            var mail = {
                from: _this.from,
                to: address,
                subject: 'Reset your password',
                text: "To reset your password please click on this link: " + token
            };
            send(mail);
        }; };
        this.verification = function (send) { return function (_a) {
            var address = _a.address, user = _a.user, token = _a.token;
            var mail = {
                from: _this.from,
                to: address,
                subject: 'Verify your account email',
                text: "To verify your account email please click on this link: " + token
            };
            send(mail);
        }; };
        var configuration = lodash_1.merge({}, defaultConfig, config);
        this.from = configuration.from;
    }
    return NotificationEmailPluginPassword;
}());
exports.default = NotificationEmailPluginPassword;
//# sourceMappingURL=NotificationPluginEmailPassword.js.map