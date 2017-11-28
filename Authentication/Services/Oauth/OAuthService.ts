class OAuthService {
  constructor(options) {
    this.serviceTransport = options.transport
  }

  link = accountsServer => {
    this.accountsServer = accountsServer
    this.databaseInterface = accountsServer.databaseInterface
  }

  public authenticate = async params => {
    if (!params.provider || !this.providers[param.provider])
      throw new Error('Invalid provider')

    const userProvider = this.providers[param.provider]

    const oauthUser = await userProvider.authenticate(params)

    let user = await this.databaseInterface.findUserByServiceId(
      params.provider,
      oauthUser.id
    )

    if (!user && oauthUser.email)
      user = await this.databaseInterface.findUserByEmail(oauthUser.email)

    if (!user) {
      const userId = await this.databaseInterface.createUser({
        email: oauthUser.email,
        profile: oauthUser.profile
      })

      user = await this.databaseInterface.findUserById(userId)
    } else {
      // If user exist, attmpt to update profile
      this.databaseInterface.setProfile(user.id, oauthUser.profile)
    }
    await this.databaseInterface.setService(user.id, params.provider, oauthUser)
    return user
  }
}
