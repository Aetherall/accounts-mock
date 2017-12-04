import { LoginResult } from '../../Types/LoginResult';
import { AuthenticationService } from "../../Types/AuthenticationService";
import AccountsServer from "../../AccountsServer/src/AccountsServer";
import { DatabaseInterface } from "../../Types/DatabaseInterface";
import { AuthenticationProvidersOAuth, AuthenticationProviderOAuth } from "../../Types/AuthenticationProviderOAuth";
import { AuthenticationServiceOAuthConfiguration } from "../types/AuthenticationServiceOAuthConfiguration";
import { ConnectionInformations } from "../../Types/ConnectionInformations";
import { User } from '../../Types/User';

import { forEach } from 'lodash';

export default class AuthenticationServiceOAuth implements AuthenticationService {
  
  public name: string = 'oauth';

  private accountsServer: AccountsServer;

  private databaseInterface: DatabaseInterface;

  private authenticationProviders: AuthenticationProvidersOAuth;

  constructor(config: AuthenticationServiceOAuthConfiguration) {

    this.authenticationProviders = config.authenticationProviders.reduce(
      ( a: AuthenticationProvidersOAuth, authenticationProvider: AuthenticationProviderOAuth ) =>
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
    
    const provider: AuthenticationProviderOAuth = this.authenticationProviders[providerName];
    
    if(!provider) throw new Error(`[ Accounts - OAuth ] useService : No provider matches ${providerName} `)
    
    const actionName: string = target.action;

    const OAuthAction: Function = this[actionName];

    if(OAuthAction) return OAuthAction(provider, params, connectionInfo);

    const providerAction: Function = provider[actionName];

    if(!providerAction) throw new Error(`[ Accounts - OAuth ] useService : No action matches ${actionName} `)

    return providerAction( params, connectionInfo )
  }

  public authenticate = async ( provider: AuthenticationProviderOAuth , params, connectionInfo: ConnectionInformations ) : Promise <LoginResult> => {

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
