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
var toMongoId_1 = require("./utils/toMongoId");
var defaultConfiguration = {
    userCollectionName: 'users',
    sessionCollectionName: 'sessions',
    idProvider: undefined,
    dateProvider: undefined,
    caseSensitiveUserName: true,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    useMongoId: {
        user: true,
        session: true
    }
};
var MongoInterface = (function () {
    function MongoInterface(db, config) {
        var _this = this;
        this.waitForDatabaseConnection = function (db) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4, db];
                    case 1:
                        _a.db = _b.sent();
                        console.log(this.db.Db);
                        this.userCollection = db.collection(this.config.userCollectionName);
                        this.sessionCollection = db.collection(this.config.sessionCollectionName);
                        return [2];
                }
            });
        }); };
        this.mongoId = function (id, userOrSession) { return _this.config.useMongoId[userOrSession] ? toMongoId_1.toMongoID(id) : id; };
        this.provideId = function () { return _this.config.idProvider && { _id: _this.config.idProvider() }; };
        this.createUser = function (_a) {
            var email = _a.email, username = _a.username, password = _a.password;
            return __awaiter(_this, void 0, void 0, function () {
                var user, ret;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            user = __assign({ services: __assign({}, password && { bcrypt: password }) }, email && { emails: [{ address: email.toLowerCase(), verified: false }] }, username && { username: username }, this.provideId(), { createdAt: Date.now(), updatedAt: Date.now() });
                            return [4, this.userCollection.insertOne(user)];
                        case 1:
                            ret = _b.sent();
                            return [2, ret.ops[0]._id];
                    }
                });
            });
        };
        this.findUserById = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var id, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        return [4, this.userCollection.findOne({ _id: id })];
                    case 1:
                        user = _a.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.findUserByEmail = function (email) { return __awaiter(_this, void 0, void 0, function () {
            var filter, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = { 'emails.address': email.toLowerCase() };
                        return [4, this.userCollection.findOne(filter)];
                    case 1:
                        user = _a.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.findUserByUsername = function (username) { return __awaiter(_this, void 0, void 0, function () {
            var filter, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = this.config.caseSensitiveUserName
                            ? { username: username }
                            : { $where: "obj.username && (obj.username.toLowerCase() === \"" + username.toLowerCase() + "\")" };
                        return [4, this.userCollection.findOne(filter)];
                    case 1:
                        user = _a.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.findPasswordHash = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var id, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        return [4, this.findUserById(id)];
                    case 1:
                        user = _a.sent();
                        if (user)
                            return [2, lodash_1.get(user, 'services.password.bcrypt')];
                        return [2, null];
                }
            });
        }); };
        this.findUserByEmailVerificationToken = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var filter, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = { 'services.email.verificationTokens.token': token };
                        return [4, this.userCollection.findOne(filter)];
                    case 1:
                        user = _a.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.findUserByResetPasswordToken = function (token) { return __awaiter(_this, void 0, void 0, function () {
            var filter, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = { 'services.email.reset.token': token };
                        return [4, this.userCollection.findOne(filter)];
                    case 1:
                        user = _a.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.findUserByServiceId = function (serviceName, serviceId) { return __awaiter(_this, void 0, void 0, function () {
            var filter, user, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        filter = (_a = {}, _a["services." + serviceName + ".id"] = serviceId, _a);
                        return [4, this.userCollection.findOne(filter)];
                    case 1:
                        user = _b.sent();
                        if (user)
                            user.id = user._id;
                        return [2, user];
                }
            });
        }); };
        this.addEmail = function (userId, newEmail, verified) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $addToSet: {
                                emails: { address: newEmail.toLowerCase(), verified: verified },
                            },
                            $set: (_a = {}, _a[this.config.timestamps.updatedAt] = Date.now(), _a),
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2];
                }
            });
        }); };
        this.removeEmail = function (userId, email) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $pull: { emails: { address: email.toLowerCase() } },
                            $set: (_a = {}, _a[this.config.timestamps.updatedAt] = Date.now(), _a),
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2];
                }
            });
        }); };
        this.verifyEmail = function (userId, email) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id, 'emails.address': email };
                        modifier = {
                            $set: (_a = {
                                    'emails.$.verified': true
                                },
                                _a[this.config.timestamps.updatedAt] = Date.now(),
                                _a),
                            $pull: { 'services.email.verificationTokens': { address: email } },
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2];
                }
            });
        }); };
        this.setUsername = function (userId, newUsername) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $set: (_a = {
                                    username: newUsername
                                },
                                _a[this.config.timestamps.updatedAt] = Date.now(),
                                _a)
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2];
                }
            });
        }); };
        this.setPassword = function (userId, newPassword) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $set: (_a = {
                                    'services.password.bcrypt': newPassword
                                },
                                _a[this.config.timestamps.updatedAt] = Date.now(),
                                _a),
                            $unset: {
                                'services.password.reset': '',
                            },
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2];
                }
            });
        }); };
        this.setService = function (userId, serviceName, service) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $set: (_a = {},
                                _a["services." + serviceName] = service,
                                _a[this.config.timestamps.updatedAt] = Date.now(),
                                _a),
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        ret = _b.sent();
                        if (ret.result.nModified === 0)
                            throw new Error('User not found');
                        return [2, service];
                }
            });
        }); };
        this.createSession = function (userId, connectionInformations, extraData) { return __awaiter(_this, void 0, void 0, function () {
            var session, ret, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = __assign({}, this.provideId(), (_a = { userId: userId,
                                connectionInformations: connectionInformations,
                                extraData: extraData, valid: true }, _a[this.config.timestamps.createdAt] = this.config.dateProvider(), _a[this.config.timestamps.updatedAt] = this.config.dateProvider(), _a));
                        return [4, this.sessionCollection.insertOne(session)];
                    case 1:
                        ret = _b.sent();
                        return [2, ret.ops[0]._id];
                }
            });
        }); };
        this.updateSession = function (sessionId, connectionInformations) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(sessionId, 'session');
                        filter = { _id: id };
                        modifier = {
                            $set: (_a = {
                                    connectionInformations: connectionInformations
                                },
                                _a[this.config.timestamps.updatedAt] = this.config.dateProvider(),
                                _a)
                        };
                        return [4, this.sessionCollection.update(filter, modifier)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        }); };
        this.invalidateSession = function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(sessionId, 'session');
                        filter = { _id: id };
                        modifier = {
                            $set: (_a = {
                                    valid: false
                                },
                                _a[this.config.timestamps.updatedAt] = this.config.dateProvider(),
                                _a)
                        };
                        return [4, this.sessionCollection.update(filter, modifier)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        }); };
        this.invalidateAllSessions = function (userId) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { userId: id };
                        modifier = {
                            $set: (_a = {
                                    valid: false
                                },
                                _a[this.config.timestamps.updatedAt] = this.config.dateProvider(),
                                _a)
                        };
                        return [4, this.sessionCollection.updateMany(filter, modifier)];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        }); };
        this.findSessionById = function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter;
            return __generator(this, function (_a) {
                id = this.mongoId(sessionId, 'session');
                filter = { _id: id };
                return [2, this.sessionCollection.findOne(filter)];
            });
        }); };
        this.addEmailVerificationToken = function (userId, email, token) { return __awaiter(_this, void 0, void 0, function () {
            var id, filter, modifier;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.mongoId(userId, 'user');
                        filter = { _id: id };
                        modifier = {
                            $push: {
                                'services.email.verificationTokens': {
                                    token: token,
                                    address: email.toLowerCase(),
                                    when: Date.now(),
                                },
                            },
                        };
                        return [4, this.userCollection.update(filter, modifier)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        this.addResetPasswordToken = function (userId, email, token, reason) {
            if (reason === void 0) { reason = 'reset'; }
            return __awaiter(_this, void 0, void 0, function () {
                var id, filter, modifier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = this.mongoId(userId, 'user');
                            filter = { _id: id };
                            modifier = {
                                $push: {
                                    'services.password.reset': {
                                        token: token,
                                        address: email.toLowerCase(),
                                        when: Date.now(),
                                        reason: reason,
                                    },
                                },
                            };
                            return [4, this.userCollection.update(filter, modifier)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        };
        this.setResetPassword = function (userId, email, newPassword) { return __awaiter(_this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                id = this.mongoId(userId, 'user');
                return [2, this.setPassword(id, newPassword)];
            });
        }); };
        this.config = lodash_1.merge({}, defaultConfiguration, config);
        this.waitForDatabaseConnection(db);
    }
    return MongoInterface;
}());
exports.default = MongoInterface;
//# sourceMappingURL=MongoInterface.js.map