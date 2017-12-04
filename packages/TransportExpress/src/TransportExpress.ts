import { ConnectionInformations, TokenTransport, UserSafe, ImpersonationResult, Tokens, LoginResult } from '@types/accounts';

import { ExpressTransportConfiguration } from './types/ExpressTransportConfiguration';

import AccountsServer from '@accounts/server';

import { Router } from 'express';

import { getConnectionInfo } from '../utils/getConnectionInfos';

export default class TransportExpress {

  private accountsServer: AccountsServer;

  private tokenTransport: TokenTransport;

	private router: any;
	
	private path: string;
	

  constructor( config: ExpressTransportConfiguration ){

    this.accountsServer = config.accountsServer;

    this.tokenTransport = config.tokenTransport;

    this.path = config.path;

    this.router = Router()
      .use(this.middleware)
      .post(`${this.path}/impersonate`, this.impersonate)
      .post(`${this.path}/user`, this.user)
      .post(`${this.path}/refreshTokens`, this.refreshTokens)
      .post(`${this.path}/logout`, this.logout)
      .post(`${this.path}/:service/:provider?/:action`, this.useService)

  }

  link = ( accountsServer: AccountsServer ) : this => {
    
    this.accountsServer = accountsServer;
        
    return this;
    
  }

  // middleware
  middleware = async ( req: any, res: any, next: Function ) : Promise <void> => {
		// Retrieve access token
		const accessToken: string | null = this.tokenTransport.getAccessToken(req);

		if(!accessToken) next(); // If no accessToken from client => do nothing

		// If there is an accessToken provided by client => try to resume session
		const user: UserSafe = await this.accountsServer.resumeSession(accessToken);

		// Assign result of session resuming to request object 
		req.user = user;
		req.userId = user.id;

		next();
  }

  send = ( res: any, data: any = {} ) : void => {

    const toSend: any = res.toSend || {};

    res.json({ ...data, ...toSend })
  }



  impersonate = async ( req: any, res: any ) : Promise <void> => {
      
      const username: string = req.body.username;

      const accessToken: string | null = this.tokenTransport.getAccessToken(req);

      const connectionInfo: ConnectionInformations = getConnectionInfo(req);

      const { authorized, tokens, user } : ImpersonationResult = await this.accountsServer.impersonate(accessToken, username, connectionInfo);

      this.tokenTransport.setTokens(tokens, { req, res });

      this.send(res, { authorized, user })

  } 
    
  user = async ( req: any, res: any ) : Promise <void> => {

      const accessToken: string | null = this.tokenTransport.getAccessToken(req);

      const user : UserSafe = await this.accountsServer.resumeSession(accessToken);

      this.send(res, user)
  }

  refreshTokens = async ( req: any, res: any ) : Promise <void> => {

      const requestTokens: Tokens = this.tokenTransport.getTokens(req);

      const connectionInfo: ConnectionInformations = getConnectionInfo(req);

      const { tokens, user, sessionId } : LoginResult = await this.accountsServer.refreshTokens(requestTokens, connectionInfo);

      this.tokenTransport.setTokens(tokens, { req, res });

      this.send(res, { user, sessionId });
  }

  logout = async ( req: any, res: any ) : Promise <void> => {

      const accessToken: string | null = this.tokenTransport.getAccessToken(req);

      await this.accountsServer.logout(accessToken);

      this.send(res, { message: 'Logged out' })
      
  }

  useService = async ( req: any, res: any ) : Promise <void> => {
    // Identify the service
    const target: any = req.params;

    // Extract the action parameters
    const params: any = req.body;
    
    // Extract the connection informations from the request
    const connectionInfo: ConnectionInformations = getConnectionInfo(req)

    const { tokens, ...response } : any = await this.accountsServer.useService(target, params, connectionInfo);

    if(tokens) this.tokenTransport.setTokens(tokens, { req, res });

    this.send(res, response);
  }

}