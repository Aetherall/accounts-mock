const defaultCookieDirectives = {
  secure: true,
  httpOnly: true,
  expires: '1d',
  maxAge: '1d',
  domain: false,
  path: '/',
  sameSite: 'Strict'
}

const defaultCookieConfig = {
  access: {
    name: 'accessToken',
    canStore: () => true,
    ...defaultCookieDirectives
  },
  refresh: {
    name: 'refreshToken',
    canStore: () => true,
    ...defaultCookieDirectives
  }
}

class ExpressTTSCookie {
  public accessConfig
  public refreshConfig

  constructor(config) {
    this.accessConfig = { ...defaultCookieConfig.access, ...config.accessCookie }
    this.refreshConfig = { ...defaultCookieConfig.refresh, ...config.refreshCookie }
  }

  setAccessToken = ( accessToken, tokenContainer ) => {
    const { req, res } = tokenContainer;
    const canStore = this.accessConfig.canStore(req);
    if(!canStore) return;
    const { name, ...accessConfig } = this.accessConfig;
    res.cookie(name, accessToken, accessConfig)
  }

  setRefreshToken = ( refreshToken, tokenContainer ) => {
    const { req, res } = tokenContainer;
    const canStore = this.refreshConfig.canStore(req);
    if(!canStore) return;
    const { name, ...refreshConfig } = this.refreshConfig;
    res.cookie(name, refreshToken, refreshConfig)
  }

  setTokens = ( tokens, tokenContainer ) => {
    const { accessToken, refreshToken } = tokens
    this.setAccessToken(accessToken, tokenContainer);
    this.setRefreshToken(refreshToken, tokenContainer);
  }

  getAccessToken = (req) => req.cookie[this.accessConfig.name]

  getRefreshToken = (req) => req.cookie[this.refreshConfig.name]

  getTokens = (req) => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
