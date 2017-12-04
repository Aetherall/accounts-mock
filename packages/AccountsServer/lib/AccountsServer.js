"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AccountsServer = (function () {
    function AccountsServer(config) {
        var _this = this;
        this.checkconfig = function (config) {
            if (!config.databaseInterface)
                throw new Error('[ Accounts - Server ] Init : A database interface is required');
            if (!config.authenticationServices)
                throw new Error('[ Accounts - Server ] Init : At least one Authentication Service is required');
        };
        this.useNotificationService = function (notificationServiceName) {
            var notificationService = _this.notificationServices[notificationServiceName];
            if (!notificationService)
                throw new Error("[ Accounts - Server ] useNotificationService : notificationService " + notificationServiceName + " not found");
            return notificationService;
        };
        this.useService = function (target, params, connectionInfo) {
            var service = target.service, serviceParams = __rest(target, ["service"]);
            var authenticationService = _this.authenticationServices[service];
            if (!authenticationService)
                throw new Error("[ Accounts - AuthenticationManager ] useService : Service " + service + " not found");
            return authenticationService.useService(serviceParams, params, connectionInfo);
        };
        this.loginWithUser = function (dbUser, connectionInfo) { return __awaiter(_this, void 0, void 0, function () {
            var sessionId, tokens, user, loginResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.databaseInterface.createSession(dbUser.id, connectionInfo)];
                    case 1:
                        sessionId = _a.sent();
                        tokens = {
                            accessToken: this.tokenManager.generateAccess({ sessionId: sessionId }),
                            refreshToken: this.tokenManager.generateRefresh()
                        };
                        user = this.sanitizeUser(dbUser);
                        loginResult = { user: user, sessionId: sessionId, tokens: tokens };
                        return [2, loginResult];
                }
            });
        }); };
        this.impersonate = function (accessToken, username, connectionInfo) { return __awaiter(_this, void 0, void 0, function () {
            var session, dbUser, impersonatedUser, isAuthorized, newSessionId, impersonationTokens, user, impersonationResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof accessToken !== 'string')
                            throw new Error('[ Accounts - Server ] Impersonate : An accessToken is required');
                        return [4, this.tokenManager.decode(accessToken)];
                    case 1:
                        _a.sent();
                        return [4, this.findSessionByAccessToken(accessToken)];
                    case 2:
                        session = _a.sent();
                        if (!session.valid)
                            throw new Error('Session is not valid for user');
                        return [4, this.databaseInterface.findUserById(session.userId)];
                    case 3:
                        dbUser = _a.sent();
                        if (!dbUser)
                            throw new Error('User not found');
                        return [4, this.databaseInterface.findUserByUsername(username)];
                    case 4:
                        impersonatedUser = _a.sent();
                        if (!impersonatedUser)
                            throw new Error("User " + username + " not found");
                        if (!this.impersonationAuthorize)
                            return [2, { authorized: false }];
                        return [4, this.impersonationAuthorize(dbUser, impersonatedUser)];
                    case 5:
                        isAuthorized = _a.sent();
                        if (!isAuthorized)
                            return [2, { authorized: false }];
                        return [4, this.databaseInterface.createSession(impersonatedUser.id, connectionInfo, { impersonatorUserId: dbUser.id })];
                    case 6:
                        newSessionId = _a.sent();
                        impersonationTokens = this.createTokens(newSessionId, true);
                        user = this.sanitizeUser(impersonatedUser);
                        impersonationResult = {
                            authorized: true,
                            tokens: impersonationTokens,
                            user: user,
                        };
                        return [2, impersonationResult];
                }
            });
        }); };
        this.createTokens = function (sessionId, isImpersonated) {
            var accessToken = _this.tokenManager.generateAccess({ sessionId: sessionId, isImpersonated: isImpersonated });
            var refreshToken = _this.tokenManager.generateRefresh({ sessionId: sessionId, isImpersonated: isImpersonated });
            var tokens = { accessToken: accessToken, refreshToken: refreshToken };
            return tokens;
        };
        this.refreshTokens = function (tokens, connectionInfo) { return __awaiter(_this, void 0, void 0, function () {
            var accessToken, refreshToken, sessionId, session, user, newTokens, loginResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessToken = tokens.accessToken, refreshToken = tokens.refreshToken;
                        if (!(typeof accessToken === "string" && typeof refreshToken === "string"))
                            throw new Error('[ Accounts - Server ] RefreshTokens : An accessToken and refreshToken are required');
                        return [4, this.tokenManager.decode(refreshToken)];
                    case 1:
                        _a.sent();
                        return [4, this.tokenManager.decode(accessToken)];
                    case 2:
                        sessionId = (_a.sent()).sessionId;
                        return [4, this.databaseInterface.findSessionById(sessionId)];
                    case 3:
                        session = _a.sent();
                        if (!session)
                            throw new Error('Session not found');
                        if (!session.valid)
                            throw new Error('Session is no longer valid');
                        return [4, this.databaseInterface.findUserById(session.userId)];
                    case 4:
                        user = _a.sent();
                        if (!user)
                            throw new Error('User not found');
                        newTokens = this.createTokens(sessionId);
                        return [4, this.databaseInterface.updateSession(sessionId, connectionInfo)];
                    case 5:
                        _a.sent();
                        loginResult = {
                            sessionId: sessionId,
                            user: this.sanitizeUser(user),
                            tokens: newTokens
                        };
                        return [2, loginResult];
                }
            });
        }); };
        this.logout = function (accessToken) { return __awaiter(_this, void 0, void 0, function () {
            var session, dbUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.findSessionByAccessToken(accessToken)];
                    case 1:
                        session = _a.sent();
                        if (!session.valid)
                            throw new Error('Session is no longer valid');
                        return [4, this.databaseInterface.findUserById(session.userId)];
                    case 2:
                        dbUser = _a.sent();
                        if (!dbUser)
                            throw new Error('User not found');
                        return [4, this.databaseInterface.invalidateSession(session.sessionId)];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        this.resumeSession = function (accessToken) { return __awaiter(_this, void 0, void 0, function () {
            var session, dbUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.findSessionByAccessToken(accessToken)];
                    case 1:
                        session = _a.sent();
                        if (!session.valid)
                            throw new Error('Session is no longer valid');
                        return [4, this.databaseInterface.findUserById(session.userId)];
                    case 2:
                        dbUser = _a.sent();
                        if (!dbUser)
                            throw new Error('User not found');
                        if (!this.resumeSessionValidator) return [3, 4];
                        return [4, this.resumeSessionValidator(dbUser, session)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        user = this.sanitizeUser(dbUser);
                        return [2, user];
                }
            });
        }); };
        this.findSessionByAccessToken = function (accessToken) { return __awaiter(_this, void 0, void 0, function () {
            var decodedAccessToken, sessionId, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof accessToken !== 'string')
                            throw new Error('An accessToken is required');
                        return [4, this.tokenManager.decode(accessToken)];
                    case 1:
                        decodedAccessToken = _a.sent();
                        sessionId = decodedAccessToken.data.sessionId;
                        return [4, this.databaseInterface.findSessionById(sessionId)];
                    case 2:
                        session = _a.sent();
                        if (!session)
                            throw new Error('Session not found');
                        return [2, session];
                }
            });
        }); };
        this.sanitizeUser = function (user) {
            var services = user.services, usersafe = __rest(user, ["services"]);
            return usersafe;
        };
        this.checkconfig(config);
        this.impersonationAuthorize = config.impersonationAuthorize;
        this.resumeSessionValidator = config.resumeSessionValidator;
        this.databaseInterface = config.databaseInterface;
        this.tokenManager = config.tokenManager;
        this.transport = config.transport.link(this);
        this.authenticationServices = config.authenticationServices.reduce(function (a, authenticationService) {
            return (__assign({}, a, (_a = {}, _a[authenticationService.name] = authenticationService, _a)));
            var _a;
        }, {});
        this.notificationServices = config.notificationServices.reduce(function (a, notificationService) {
            return (__assign({}, a, (_a = {}, _a[notificationService.name] = notificationService, _a)));
            var _a;
        }, {});
    }
    return AccountsServer;
}());
exports.default = AccountsServer;
//# sourceMappingURL=AccountsServer.js.map