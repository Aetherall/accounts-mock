"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AuthenticationServiceOAuth = (function () {
    function AuthenticationServiceOAuth(config) {
        var _this = this;
        this.name = 'oauth';
        this.link = function (accountsServer) {
            _this.accountsServer = accountsServer;
            _this.databaseInterface = accountsServer.databaseInterface;
            return _this;
        };
        this.useService = function (target, params, connectionInfo) {
            var providerName = target.provider;
            var provider = _this.authenticationProviders[providerName];
            if (!provider)
                throw new Error("[ Accounts - OAuth ] useService : No provider matches " + providerName + " ");
            var actionName = target.action;
            var OAuthAction = _this[actionName];
            if (OAuthAction)
                return OAuthAction(provider, params, connectionInfo);
            var providerAction = provider[actionName];
            if (!providerAction)
                throw new Error("[ Accounts - OAuth ] useService : No action matches " + actionName + " ");
            return providerAction(params, connectionInfo);
        };
        this.authenticate = function (provider, params, connectionInfo) { return __awaiter(_this, void 0, void 0, function () {
            var oauthUser, user, userId, loginResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, provider.authenticate(params)];
                    case 1:
                        oauthUser = _a.sent();
                        return [4, this.databaseInterface.findUserByServiceId(provider.name, oauthUser.id)];
                    case 2:
                        user = _a.sent();
                        if (!(!user && oauthUser.email)) return [3, 4];
                        return [4, this.databaseInterface.findUserByEmail(oauthUser.email)];
                    case 3:
                        user = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!!user) return [3, 7];
                        return [4, this.databaseInterface.createUser({ email: oauthUser.email })];
                    case 5:
                        userId = _a.sent();
                        return [4, this.databaseInterface.findUserById(userId)];
                    case 6:
                        user = _a.sent();
                        _a.label = 7;
                    case 7: return [4, this.databaseInterface.setService(user.id, provider.name, oauthUser)];
                    case 8:
                        _a.sent();
                        return [4, this.accountsServer.loginWithUser(user, connectionInfo)];
                    case 9:
                        loginResult = _a.sent();
                        return [2, loginResult];
                }
            });
        }); };
        this.authenticationProviders = config.authenticationProviders.reduce(function (a, authenticationProvider) {
            return a[authenticationProvider.name] = authenticationProvider;
        }, {});
    }
    return AuthenticationServiceOAuth;
}());
exports.default = AuthenticationServiceOAuth;
//# sourceMappingURL=AuthenticationServiceOAuth.js.map