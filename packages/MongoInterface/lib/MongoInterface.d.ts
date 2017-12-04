import { DatabaseInterface } from '@types/accounts';
import { MongoInterfaceConfiguration } from './types/MongoInterfaceConfiguration';
export default class MongoInterface implements DatabaseInterface {
    private config;
    private db;
    private userCollection;
    private sessionCollection;
    constructor(db: any, config?: MongoInterfaceConfiguration);
    waitForDatabaseConnection: (db: any) => Promise<void>;
    mongoId: (id: string, userOrSession: string) => any;
    provideId: () => {
        _id: string | object;
    };
    createUser: ({email, username, password}: {
        email: string;
        username: string;
        password: string;
    }) => Promise<string>;
    findUserById: (userId: string) => Promise<any>;
    findUserByEmail: (email: string) => Promise<any>;
    findUserByUsername: (username: string) => Promise<any>;
    findPasswordHash: (userId: string) => Promise<string>;
    findUserByEmailVerificationToken: (token: string) => Promise<any>;
    findUserByResetPasswordToken: (token: string) => Promise<any>;
    findUserByServiceId: (serviceName: string, serviceId: string) => Promise<any>;
    addEmail: (userId: string, newEmail: string, verified: boolean) => Promise<void>;
    removeEmail: (userId: string, email: string) => Promise<void>;
    verifyEmail: (userId: string, email: string) => Promise<void>;
    setUsername: (userId: string, newUsername: string) => Promise<void>;
    setPassword: (userId: string, newPassword: string) => Promise<void>;
    setService: (userId: string, serviceName: string, service: object) => Promise<object>;
    createSession: (userId: string, connectionInformations: any, extraData?: object) => Promise<string>;
    updateSession: (sessionId: string, connectionInformations: any) => Promise<void>;
    invalidateSession: (sessionId: string) => Promise<void>;
    invalidateAllSessions: (userId: string) => Promise<void>;
    findSessionById: (sessionId: string) => Promise<any>;
    addEmailVerificationToken: (userId: string, email: string, token: string) => Promise<void>;
    addResetPasswordToken: (userId: string, email: string, token: string, reason?: string) => Promise<void>;
    setResetPassword: (userId: string, email: string, newPassword: string) => Promise<void>;
}
