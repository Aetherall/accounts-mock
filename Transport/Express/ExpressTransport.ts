import { Router } from 'express';

import requestIp from 'request-ip';

export const getUserAgent = req => {
  let userAgent = req.headers['user-agent'] || '';
  if (req.headers['x-ucbrowser-ua']) {
    // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'];
  }
  return userAgent;
};

const getConnectionInfo = (req) => ({
    userAgent: getUserAgent(req),
    ip: requestIp.getClientIp(req)
})

class ExpressTransport {

  private accountsServer: AccountsServer;
  private databaseInterface;
  private authenticationService;
  private notificationService;

  private tokensTransportStorage;

  private router;
  private config;

  constructor(config){
    this.accountsServer = config.accountsServer;
    this.databaseInterface = config.databaseInterface;
    this.authenticationService = config.authenticationService;
    this.notificationService = config.notificationService;

    this.tokensTransportStorage = config.tokensTransportStorage;
  }

  buildRouter(){
    this.router = Router()
      .use(this.middleware)
      .post(`${this.config.path}/impersonate`, this.impersonate)
      .post(`${this.config.path}/user`, this.user)
      .post(`${this.config.path}/refreshTokens`, this.refreshTokens)
      .post(`${this.config.path}/logout`, this.logout)
      .post(`${this.config.path}/:service/authenticate`, this.authenticate)
  }

    

    // middleware
    middleware = async (req, res, next) => {
        // Retrieve access token
        const { accessToken } = this.tokensTransportStorage.getTokens(req);

        if(!accessToken) next(); // If no accessToken from client => do nothing

        // If there is an accessToken provided by client => try to resume session
        const user = await this.accountsServer.resumeSession(accessToken);

        // Assign result of session resuming to request object 
        req.user = user;
        req.userId = user.id;
        next();
    }


    authenticate = async (req, res) => {
        // Identify the service used to authenticate
        const serviceName = req.params.service;

        // Extract the connection informations from the request
        const connectionInfo = getConnectionInfo(req)

        // Extract the connection parameters from the request
        const params = req.body;

        // try to login
        const {user, sessionId, tokens} = await this.accountsServer.loginWithService(serviceName, params, connectionInfo)

        // set Tokens to request and get response body
        const responseBody = this.tokensTransportStorage.setToken(res, tokens);

        // Send response to client
        res.json(responseBody);
    }



    impersonate = async (req, res ) => {
        const { username } = req.body;
        const { accessToken } = this.tokensTransportStorage.getTokens();

        const connectionInfo = getConnectionInfo(req)
        const { authorized, tokens, user } = await this.accountsServer.impersonate(accessToken, username, connectionInfo);

        const responseBody = this.tokensTransportStorage.setToken(res, tokens);

        res.json({...responseBody, authorized, user })

    } 
    
    user = async (req, res) => {
        const { accessToken } = this.tokensTransportStorage.getTokens();
        const {services, ...user} = await this.accountsServer.resumeSession(accessToken);
        res.json(user)
    }

    refreshTokens = async (req, res) => {
        const requestTokens = this.tokensTransportStorage.getTokens();

        const connectionInfo = getConnectionInfo(req);

        const { tokens, ...refreshedSession } = await this.accountsServer.refreshTokens(requestTokens, connectionInfo);

        const responseBody = this.tokensTransportStorage.setToken(res, tokens);
    }

    logout = async (req, res) => {
        const { accessToken } = this.tokensTransportStorage.getTokens();

        await this.accountsServer.logout(accessToken);

        res.json({ message: 'Logged out' });
    }

    



}