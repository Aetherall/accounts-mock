import { TokenManagerInterface, DatabaseInterface, ConnectionInformations, User, UserSafe, Session, Tokens, LoginResult, ImpersonationResult, NotificationService } from '@types/accounts';
import { AccountsServerConfiguration } from "./types/AccountsServerConfiguration";
export default class AccountsServer {
    databaseInterface: DatabaseInterface;
    tokenManager: TokenManagerInterface;
    transport: any;
    private authenticationServices;
    private notificationServices;
    private impersonationAuthorize?;
    private resumeSessionValidator?;
    constructor(config: AccountsServerConfiguration);
    checkconfig: (config: AccountsServerConfiguration) => void;
    useNotificationService: (notificationServiceName: string) => NotificationService;
    useService: (target: any, params: any, connectionInfo: ConnectionInformations) => any;
    loginWithUser: (dbUser: User, connectionInfo: ConnectionInformations) => Promise<LoginResult>;
    impersonate: (accessToken: string, username: string, connectionInfo: ConnectionInformations) => Promise<ImpersonationResult>;
    createTokens: (sessionId: string, isImpersonated?: boolean) => Tokens;
    refreshTokens: (tokens: Tokens, connectionInfo: ConnectionInformations) => Promise<LoginResult>;
    logout: (accessToken: string) => Promise<void>;
    resumeSession: (accessToken: string) => Promise<UserSafe>;
    findSessionByAccessToken: (accessToken: string) => Promise<Session>;
    sanitizeUser: (user: User) => UserSafe;
}
