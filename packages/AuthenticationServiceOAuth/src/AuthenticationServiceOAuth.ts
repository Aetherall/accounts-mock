import { 
  LoginResult, 
  AuthenticationService, 
  DatabaseInterface, 
  AuthenticationOAuthProviders, 
  AuthenticationOAuthProvider,
  ConnectionInformations,
  User
} from 'accounts';

import AccountsServer from '@accounts/server';

import { AuthenticationServiceOAuthConfiguration } from "./types/AuthenticationServiceOAuthConfiguration";

import { forEach } from 'lodash';

export default class AuthenticationServiceOAuth implements AuthenticationService {
  
  public name: string = 'oauth';

  private accountsServer: AccountsServer;

  private databaseInterface: DatabaseInterface;

  private authenticationProviders: AuthenticationOAuthProviders;

  constructor(config: AuthenticationServiceOAuthConfiguration) {

    this.authenticationProviders = config.authenticationProviders.reduce(
      ( a: AuthenticationOAuthProviders, authenticationProvider: AuthenticationOAuthProvider ) =>
      a[authenticationProvider.name] = authenticationProvider
    ,{})

  }

  link = ( accountsServer: AccountsServer ) : this => {

    this.accountsServer = accountsServer;

    this.databaseInterface = accountsServer.databaseInterface;

    //forEach( this.authenticationProviders, ( authenticationProvider: AuthenticationProviderOAuth, name: string ) => authenticationProvider );

    return this;

  }

  useService = (target, params, connectionInfo: ConnectionInformations ) : any => {

    const providerName: string = target.provider;
    
    const provider: AuthenticationOAuthProvider = this.authenticationProviders[providerName];
    
    if(!provider) throw new Error(`[ Accounts - OAuth ] useService : No provider matches ${providerName} `)
    
    const actionName: string = target.action;

    const OAuthAction: Function = this[actionName];

    if(OAuthAction) return OAuthAction(provider, params, connectionInfo);

    const providerAction: Function = provider[actionName];

    if(!providerAction) throw new Error(`[ Accounts - OAuth ] useService : No action matches ${actionName} `)

    return providerAction( params, connectionInfo )
  }

  public authenticate = async ( provider: AuthenticationOAuthProvider , params, connectionInfo: ConnectionInformations ) : Promise <LoginResult> => {

    const oauthUser: any = await provider.authenticate(params)

    let user: User = await this.databaseInterface.findUserByServiceId( provider.name, oauthUser.id )

    if (!user && oauthUser.email) user = await this.databaseInterface.findUserByEmail(oauthUser.email)

    if (!user) {
      
      const userId: string = await this.databaseInterface.createUser({ email: oauthUser.email })

      user = await this.databaseInterface.findUserById(userId)
    }

    await this.databaseInterface.setService(user.id, provider.name, oauthUser)

    const loginResult: LoginResult = await this.accountsServer.loginWithUser(user, connectionInfo);
    
    return loginResult

  }
}
