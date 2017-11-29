
const defaultConfig = {
  access: {
    name: 'accessToken',
    canStore: () => true
  },
  refresh: {
    name: 'refreshToken',
    canStore: () => true
  }
}


class ExpressTTSHeaders {
  public accessConfig
  public refreshConfig

  constructor(config) {
    this.accessConfig = { ...defaultConfig.access, ...config.access };
    this.refreshConfig = { ...defaultConfig.refresh, ...config.refresh };
  }

  setAccessToken = ( accessToken, tokenContainer ) => {
    const { req, res } = tokenContainer;
    const canStore = this.accessConfig.canStore(req);
    if(!canStore) return;
    res.set(this.accessConfig.name, accessToken)
  }

  setRefreshToken = ( refreshToken, tokenContainer ) => {
    const { req, res } = tokenContainer;
    const canStore = this.refreshConfig.canStore(req);
    if(!canStore) return;
    res.set(this.refreshConfig.name, refreshToken)
  }

  setTokens = ( tokens, tokenContainer ) => {
    const { accessToken, refreshToken } = tokens
    this.setAccessToken(accessToken, tokenContainer);
    this.setRefreshToken(refreshToken, tokenContainer);
  }

  getAccessToken = (req) => req.get(this.accessConfig.name)

  getRefreshToken = (req) => req.get(this.refreshConfig.name)

  getTokens = (req) => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
