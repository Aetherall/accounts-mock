import { LoginResult, AuthenticationService, AuthenticationProviderOAuth, ConnectionInformations } from '@types/accounts';
import { AuthenticationServiceOAuthConfiguration } from "./types/AuthenticationServiceOAuthConfiguration";
export default class AuthenticationServiceOAuth implements AuthenticationService {
    name: string;
    private accountsServer;
    private databaseInterface;
    private authenticationProviders;
    constructor(config: AuthenticationServiceOAuthConfiguration);
    link: (accountsServer: any) => this;
    useService: (target: any, params: any, connectionInfo: ConnectionInformations) => any;
    authenticate: (provider: AuthenticationProviderOAuth, params: any, connectionInfo: ConnectionInformations) => Promise<LoginResult>;
}
