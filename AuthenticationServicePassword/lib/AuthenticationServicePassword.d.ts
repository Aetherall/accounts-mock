import AccountsServer from '@accounts/server';
import { AuthenticationService, DatabaseInterface, ConnectionInformations, LoginResult, RegistrationResult, Message } from '@types/accounts';
import { TokenManagerInterface } from '@accounts/token';
import { UserPasswordRegistration } from './types/UserPasswordRegistration';
import { PasswordServiceConfiguration } from './types/PasswordServiceConfiguration';
import { UserPasswordLogin } from './types/UserPasswordLogin';
export default class AuthenticationServicePassword implements AuthenticationService {
    name: string;
    private config;
    accountsServer: AccountsServer;
    databaseInterface: DatabaseInterface;
    tokenManager: TokenManagerInterface;
    private hashPassword;
    private hashAndBcryptPassword;
    constructor(config?: PasswordServiceConfiguration);
    link: (accountsServer: any) => this;
    useService: (target: any, params: any, connectionInfo: ConnectionInformations) => Promise<object>;
    register: (params: UserPasswordRegistration) => Promise<RegistrationResult>;
    verifyEmail: ({token}: {
        token: string;
    }) => Promise<Message>;
    resetPassword: ({token, newPassword}: {
        token: string;
        newPassword: string;
    }) => Promise<Message>;
    sendVerificationEmail: ({address}: {
        address: string;
    }) => Promise<Message>;
    sendResetPasswordEmail: ({address}: {
        address: string;
    }) => Promise<Message>;
    authenticate: ({username, email, userId, password}: UserPasswordLogin, connectionInfo: ConnectionInformations) => Promise<LoginResult>;
}
