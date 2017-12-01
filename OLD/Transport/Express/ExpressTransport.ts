import { Router } from 'express';

import { getClientIp } from 'request-ip';

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
    ip: getClientIp(req)
})

class ExpressTransport {

  private accountsServer: AccountsServer;
  private databaseInterface;
  private authenticationService;
  private notificationService;

  private tokenTransport;

  private router;
  private config;

  constructor(config){
    this.accountsServer = config.accountsServer;
    this.databaseInterface = config.databaseInterface;
    this.authenticationService = config.authenticationService;
    this.notificationService = config.notificationService;

    this.tokenTransport = config.tokenTransport;
  }

  buildRouter(){
    this.router = Router()
      .use(this.middleware)
      .post(`${this.config.path}/impersonate`, this.impersonate)
      .post(`${this.config.path}/user`, this.user)
      .post(`${this.config.path}/refreshTokens`, this.refreshTokens)
      .post(`${this.config.path}/logout`, this.logout)
      .post(`${this.config.path}/:service/:provider?/:action`, this.useService)
  }

    

  // middleware
  middleware = async (req, res, next) => {
      // Retrieve access token
      const accessToken = this.tokenTransport.getAccessToken(req);

      if(!accessToken) next(); // If no accessToken from client => do nothing

      // If there is an accessToken provided by client => try to resume session
      const user = await this.accountsServer.resumeSession(accessToken);

      // Assign result of session resuming to request object 
      req.user = user;
      req.userId = user.id;
      next();
  }

  send = (res, data) => {

    const toSend = res.toSend || {};

    res.json({ ...data, ...toSend })
  }


  authenticate = async (req, res) => {
      // Identify the service used to authenticate
      const serviceName = req.params.service;

      // Extract the connection informations from the request
      const connectionInfo = getConnectionInfo(req)

      // Extract the connection parameters from the request
      const params = req.body;

      // try to login
      const { user, sessionId, tokens } = await this.accountsServer.loginWithService(serviceName, params, connectionInfo)

      // set Tokens to request and get response body
      this.tokenTransport.setTokens(tokens, { req, res });

      // Send response
      this.send(res)
  }



  impersonate = async (req, res ) => {
      
      const { username } = req.body;

      const { accessToken } = this.tokenTransport.getAccessToken(req);

      const connectionInfo = getConnectionInfo(req)

      const { authorized, tokens, user } = await this.accountsServer.impersonate(accessToken, username, connectionInfo);

      this.tokenTransport.setTokens(tokens, { req, res });

      this.send(res, { authorized, user })

  } 
    
  user = async (req, res) => {

      const accessToken = this.tokenTransport.getAccessToken(req);

      const { services, ...user } = await this.accountsServer.resumeSession(accessToken);

      this.send(res, user)
  }

  refreshTokens = async (req, res) => {

      const requestTokens = this.tokenTransport.getTokens(req);

      const connectionInfo = getConnectionInfo(req);

      const { tokens, ...refreshedSession } = await this.accountsServer.refreshTokens(requestTokens, connectionInfo);

      this.tokenTransport.setToken(tokens, { req, res });

      this.send(res, refreshedSession);
  }

  logout = async (req, res) => {

      const accessToken = this.tokenTransport.getAccessToken(req);

      await this.accountsServer.logout(accessToken);

      this.send(res, { message: 'Logged out' })
      
  }

  useService = async (req, res) => {
    // Identify the service
    const target = req.params;

    // Extract the action parameters
    const params = req.body;
    
    // Extract the connection informations from the request
    const connectionInfo = getConnectionInfo(req)

    const { tokens, ...response } = await this.authenticationManager.useService(target, params, connectionInfo);

    if(tokens) this.tokenTransport.setTokens(tokens, { req, res });

    this.send(res, response);
  }

}