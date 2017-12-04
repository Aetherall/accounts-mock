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
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var getFirstUserEmail_1 = require("./utils/getFirstUserEmail");
var hashPassword_1 = require("./utils/hashPassword");
var hashAndBcryptPassword_1 = require("./utils/hashAndBcryptPassword");
var verifyPassword_1 = require("./utils/verifyPassword");
var defaultConfiguration = {
    validation: {
        username: function () { return true; },
        email: function () { return true; },
        password: function () { return true; }
    },
    passwordHashAlgorithm: 'sha256',
};
var AuthenticationServicePassword = (function () {
    function AuthenticationServicePassword(config) {
        var _this = this;
        this.name = 'password';
        this.link = function (accountsServer) {
            _this.accountsServer = accountsServer;
            _this.databaseInterface = _this.accountsServer.databaseInterface;
            _this.tokenManager = _this.accountsServer.tokenManager;
            return _this;
        };
        this.useService = function (target, params, connectionInfo) {
            var actionName = target.action;
            var action = _this[actionName];
            if (!action)
                throw new Error("[ Accounts - Password ] useService : No action matches " + actionName + " ");
            return action(params, connectionInfo);
        };
        this.register = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var username, email, password, _a, _b, newUser, _c, _d, _e, userId, registrationResult;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        username = params.username, email = params.email, password = params.password;
                        if (!username && !email)
                            throw new Error('Username or Email is required');
                        if (username && !this.config.validation.username(username))
                            throw new Error(' Username does not pass validation ');
                        if (email && !this.config.validation.email(email))
                            throw new Error(' Email does not pass validation ');
                        if (password && !this.config.validation.password(password))
                            throw new Error(' Password does not pass validation ');
                        _a = username;
                        if (!_a) return [3, 2];
                        return [4, this.databaseInterface.findUserByUsername(username)];
                    case 1:
                        _a = (_f.sent());
                        _f.label = 2;
                    case 2:
                        if (_a)
                            throw new Error('Username already exists');
                        _b = email;
                        if (!_b) return [3, 4];
                        return [4, this.databaseInterface.findUserByEmail(email)];
                    case 3:
                        _b = (_f.sent());
                        _f.label = 4;
                    case 4:
                        if (_b)
                            throw new Error('Email already exists');
                        _c = [{}, username && { username: username },
                            email && { email: email }];
                        _d = password;
                        if (!_d) return [3, 6];
                        _e = {};
                        return [4, this.hashAndBcryptPassword(password)];
                    case 5:
                        _d = (_e.password = _f.sent(), _e);
                        _f.label = 6;
                    case 6:
                        newUser = __assign.apply(void 0, _c.concat([_d]));
                        return [4, this.databaseInterface.createUser(newUser)];
                    case 7:
                        userId = _f.sent();
                        registrationResult = { userId: userId };
                        return [2, registrationResult];
                }
            });
        }); };
        this.verifyEmail = function (_a) {
            var token = _a.token;
            return __awaiter(_this, void 0, void 0, function () {
                var user, verificationTokens, tokenRecord, userEmails, emailRecord, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, this.databaseInterface.findUserByEmailVerificationToken(token)];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                throw new Error('Verify email link expired');
                            verificationTokens = lodash_1.get(user, 'services.email.verificationTokens', []);
                            tokenRecord = verificationTokens.find(function (t) { return t.token === token; });
                            userEmails = user.emails;
                            emailRecord = userEmails.find(function (e) { return e.address === tokenRecord.address; });
                            if (!emailRecord)
                                throw new Error('Verify email link is for unknown address');
                            return [4, this.databaseInterface.verifyEmail(user.id, emailRecord.address)];
                        case 2:
                            _b.sent();
                            message = { message: 'Email verified' };
                            return [2, message];
                    }
                });
            });
        };
        this.resetPassword = function (_a) {
            var token = _a.token, newPassword = _a.newPassword;
            return __awaiter(_this, void 0, void 0, function () {
                var dbUser, resetTokens, resetTokenRecord, emails, password, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, this.databaseInterface.findUserByResetPasswordToken(token)];
                        case 1:
                            dbUser = _b.sent();
                            if (!dbUser)
                                throw new Error('Reset password link expired');
                            resetTokens = lodash_1.get(dbUser, 'services.password.reset', []);
                            resetTokenRecord = resetTokens.find(function (t) { return t.token === token; });
                            if (this.accountsServer.tokenManager.isTokenExpired(token, resetTokenRecord)) {
                                throw new Error('Reset password link expired');
                            }
                            emails = dbUser.emails || [];
                            if (!emails.find(function (e) { return e.address === resetTokenRecord.address; }))
                                throw new Error('Token has invalid email address');
                            return [4, this.hashAndBcryptPassword(newPassword)];
                        case 2:
                            password = _b.sent();
                            return [4, this.databaseInterface.setResetPassword(dbUser.id, resetTokenRecord.address, password)];
                        case 3:
                            _b.sent();
                            return [4, this.databaseInterface.invalidateAllSessions(dbUser.id)];
                        case 4:
                            _b.sent();
                            message = { message: 'Password Changed' };
                            return [2, message];
                    }
                });
            });
        };
        this.sendVerificationEmail = function (_a) {
            var address = _a.address;
            return __awaiter(_this, void 0, void 0, function () {
                var dbUser, emails, token, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!address)
                                throw new Error('Invalid email');
                            return [4, this.databaseInterface.findUserByEmail(address)];
                        case 1:
                            dbUser = _b.sent();
                            if (!dbUser)
                                throw new Error('User not found');
                            emails = dbUser.emails || [];
                            if (!emails.find(function (e) { return e.address === address; }))
                                throw new Error('No such email address for user');
                            token = this.tokenManager.generateRandom();
                            return [4, this.databaseInterface.addEmailVerificationToken(dbUser.id, address, token)];
                        case 2:
                            _b.sent();
                            return [4, this.accountsServer.useNotificationService('email').notify('password', 'verification', { address: address, user: dbUser, token: token })];
                        case 3:
                            _b.sent();
                            message = { message: 'Email Sent' };
                            return [2, message];
                    }
                });
            });
        };
        this.sendResetPasswordEmail = function (_a) {
            var address = _a.address;
            return __awaiter(_this, void 0, void 0, function () {
                var dbUser, email, token, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!address)
                                throw new Error('Invalid email');
                            return [4, this.databaseInterface.findUserByEmail(address)];
                        case 1:
                            dbUser = _b.sent();
                            if (!dbUser)
                                throw new Error('User not found');
                            email = getFirstUserEmail_1.getFirstUserEmail(dbUser, address);
                            token = this.tokenManager.generateRandom();
                            return [4, this.databaseInterface.addResetPasswordToken(dbUser.id, address, token)];
                        case 2:
                            _b.sent();
                            return [4, this.accountsServer.useNotificationService('email').notify('password', 'resetPassword', { address: address, user: dbUser, token: token })];
                        case 3:
                            _b.sent();
                            message = { message: 'Email Sent' };
                            return [2, message];
                    }
                });
            });
        };
        this.authenticate = function (_a, connectionInfo) {
            var username = _a.username, email = _a.email, userId = _a.userId, password = _a.password;
            return __awaiter(_this, void 0, void 0, function () {
                var user, _b, _c, _d, hash, hashedPassword, isPasswordValid, loginResult;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!username && !email && !userId)
                                throw new Error('Username, Email or userId is Required');
                            if (!userId) return [3, 2];
                            return [4, this.databaseInterface.findUserById(userId)];
                        case 1:
                            _b = _e.sent();
                            return [3, 9];
                        case 2:
                            if (!username) return [3, 4];
                            return [4, this.databaseInterface.findUserByUsername(username)];
                        case 3:
                            _c = _e.sent();
                            return [3, 8];
                        case 4:
                            if (!email) return [3, 6];
                            return [4, this.databaseInterface.findUserByEmail(email)];
                        case 5:
                            _d = _e.sent();
                            return [3, 7];
                        case 6:
                            _d = null;
                            _e.label = 7;
                        case 7:
                            _c = _d;
                            _e.label = 8;
                        case 8:
                            _b = _c;
                            _e.label = 9;
                        case 9:
                            user = _b;
                            if (!user)
                                throw new Error('User Not Found');
                            return [4, this.databaseInterface.findPasswordHash(user.id)];
                        case 10:
                            hash = _e.sent();
                            if (!hash)
                                throw new Error('User has no password set');
                            hashedPassword = this.hashPassword(password);
                            return [4, verifyPassword_1.verifyPassword(hashedPassword, hash)];
                        case 11:
                            isPasswordValid = _e.sent();
                            if (!isPasswordValid)
                                throw new Error('Incorrect password');
                            return [4, this.accountsServer.loginWithUser(user, connectionInfo)];
                        case 12:
                            loginResult = _e.sent();
                            return [2, loginResult];
                    }
                });
            });
        };
        this.config = lodash_1.merge({}, defaultConfiguration, config);
        this.hashPassword = hashPassword_1.getHashPassword(this.config.passwordHashAlgorithm);
        this.hashAndBcryptPassword = hashAndBcryptPassword_1.getHashAndBcryptPassword(this.hashPassword);
    }
    return AuthenticationServicePassword;
}());
exports.default = AuthenticationServicePassword;
//# sourceMappingURL=AuthenticationServicePassword.js.map