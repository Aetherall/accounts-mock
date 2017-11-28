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

  setAccessToken = (res, accessToken) => {
    const { name, ...accessConfig } = this.accessConfig;
    res.cookie(name, accessToken, accessConfig)
  }

  setRefreshToken = (res, refreshToken) => {
    const { name, ...refreshConfig } = this.refreshConfig;
    res.cookie(name, refreshToken, refreshConfig)
  }

  getAccessToken = (req) => req.cookie[this.accessConfig.name]

  getRefreshToken = (req) => req.cookie[this.refreshConfig.name]

}
