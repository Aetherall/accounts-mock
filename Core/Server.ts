class AccountsServer {
    private databaseInterface;
    private tokenManager;
    private authenticationManager;
    private notificationManager;

    constructor(config){
        this.checkconfig(config);

        this.databaseInterface = config.databaseInterface;
        this.tokenManager = config.tokenManager;
        this.authenticationManager = config.authenticationManager;
        this.notificationManager = config.notificationManager;
    }

    checkconfig = (config) => {
        if(!config.databaseInterface) throw new AccountsError('[ Accounts - Server ] Init : A database driver is required');
        if(!config.services) throw new AccountsError('[ Accounts - Server ] Init : No authentication service defined');
    }



    // loginWithService( 'password', { username: '', password: ''}, connectionInfo )
    loginWithService = async (serviceName, params, connectionInfo) => {

        const service = this.services.find(service => service.name === serviceName);
        if(!service) throw new AccountsError(`[ Accounts - Server ] LoginWithService : No service matches ${serviceName}`);

        const user = await service.authenticate(params);
        if(!user) throw new AccountsError(`[ Accounts - Server ] LoginWithService : Service ${serviceName} was not able to authenticate user`);

        return this.loginWithUser(user, connectionInfo);
    }

    loginWithUser = async (user, connectionInfo) => {
        const { ip, userAgent } = connectionInfo;

        const sessionId = await this.databaseInterface.createSession(user.id, ip, userAgent);

        const tokens = {
            accessToken: this.tokenManager.generateAccess(sessionId),
            refreshToken: this.tokenManager.generateRefresh()
        }

        return { user, sessionId, tokens };
    }

    impersonate = async (accessToken, username, connectionInfo) => {

        if (!isString(accessToken)) throw new AccountsError('[ Accounts - Server ] Impersonate : An accessToken is required');

        await this.tokenManager.decode(accessToken);

        const session = await this.findSessionByAccessToken(accessToken);

        if (!session.valid) throw new AccountsError('Session is not valid for user')

        const user = await this.databaseInterface.findUserById(session.userId);

        if (!user) throw new AccountsError('User not found')

        const impersonatedUser = await this.databaseInterface.findUserByUsername(username);

        if (!impersonatedUser) throw new AccountsError(`User ${username} not found`)

        if (!this.options.impersonationAuthorize) return { authorized: false }

        const isAuthorized = await this.options.impersonationAuthorize( user, impersonatedUser );

        if (!isAuthorized) return { authorized: false }

        /*const newSessionId = await this.databaseInterface.createSession( impersonatedUser.id, connectionInfo, { impersonatorUserId: user.id });

        const impersonationTokens = this.createTokens(newSessionId, true);

        const impersonationResult = {
            authorized: true,
            tokens: impersonationTokens,
            user: this.sanitizeUser(impersonatedUser),
          };

          return impersonationResult;*/
    }
    
    createTokens = (sessionId, isImpersonated) => {
        const accessToken = this.tokenManager.generateAccess({sessionId, isImpersonated});
        const refreshToken = this.tokenManager.generateRefresh({sessionId, isImpersonated});
        return {accessToken, refreshToken}
    }

    refreshTokens = async (tokens, connectionInfo) => {
        const { accessToken, refreshToken } = tokens ;

        if (!isString(accessToken) || !isString(refreshToken)) throw new AccountsError('[ Accounts - Server ] RefreshTokens : An accessToken and refreshToken are required')
        
        await this.tokenManager.decode(refreshToken);

        const sessionId = await this.tokenManager.decode(accessToken);

        const session = await this.databaseInterface.findSessionById(sessionId);

        if(!session) throw new AccountsError('Session not found');

        if(!session.valid) throw new AccountsError('Session is no longer valid', { id: session.userId })

        const user = await this.databaseInterface.findUserById(session.userId);

        if(!user) throw new AccountsError('User not found', { id: session.userId });

        const newTokens = this.createTokens(sessionId);

        await this.databaseInterface.updateSession(sessionId, connectionInfo);

        const result = {sessionId, user, tokens: newTokens}

        return result

    }


    logout = async (accessToken) => {
        const session = await this.findSessionByAccessToken(accessToken);

        if(!session.valid) throw new AccountsError('Session is no longer valid', { id: session.userId });

        const user = await this.databaseInterface.findUserById(session.userId);

        if (!user) throw new AccountsError('User not found', { id: session.userId });

        await this.databaseInterface.invalidateSession(session.sessionId);

    }


    resumeSession = async (accessToken) => {
        const session = await this.findSessionByAccessToken(accessToken);

        if(!session.valid) throw new AccountsError('Session is no longer valid', { id: session.userId });

        const user = await this.databaseInterface.findUserById(session.userId);

        if (!user) throw new AccountsError('User not found', { id: session.userId });

        if (this.options.resumeSessionValidator) await this.options.resumeSessionValidator(user, session);

        return user;
    }


    findSessionByAccessToken = async (accessToken) => {

        if (!isString(accessToken)) throw new AccountsError('An accessToken is required');

        const decodedAccessToken = await this.tokenManager.decode(accessToken);

        const sessionId = decodedAccessToken.data.sessionId;

        const session = await this.databaseInterface.findSessionById(sessionId);

        if(!session) throw new AccountsError('Session not found');

        return session;

    }

    

}


