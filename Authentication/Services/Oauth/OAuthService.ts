class OAuthService {
  
  private databaseInterface;
  private authenticationProviders;

  constructor(authenticationProviders) {
    this.authenticationProviders = authenticationProviders.reduce(
      (a, authenticationProvider) => a[authenticationProvider.name] = authenticationProvider
    ,{})
  }

  useService = (target, params, connectionInfo) => {

    const providerName = target.provider;
    
    const provider = this.authenticationProviders[providerName];
    
    if(!provider) throw new AccountsError(`[ Accounts - OAuth ] useService : No provider matches ${providerName} `)
    
    const actionName = target.action;

    const OAuthAction = this[actionName];

    if(OAuthAction) return OAuthAction(provider, params, connectionInfo);

    const providerAction = provider[actionName];

    if(!providerAction) throw new AccountsError(`[ Accounts - OAuth ] useService : No action matches ${actionName} `)

    return providerAction( params, connectionInfo )
  }

  public authenticate = async (provider, params, connectionInfo) => {

    const oauthUser = await provider.authenticate(params)

    let user = await this.databaseInterface.findUserByServiceId( provider.name, oauthUser.id )

    if (!user && oauthUser.email) user = await this.databaseInterface.findUserByEmail(oauthUser.email)

    if (!user) {
      const userId = await this.databaseInterface.createUser({ email: oauthUser.email })
      user = await this.databaseInterface.findUserById(userId)
    }
    await this.databaseInterface.setService(user.id, provider.name, oauthUser)

    return user
  }
}
