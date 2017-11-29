
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

class ExpressTTBody {
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
    res.toSend = res.toSend instanceof Object
    ? {...res.toSend, [this.accessConfig.name]: accessToken}
    : { [this.accessConfig.name]: accessToken }
  }

  setRefreshToken =  ( refreshToken, tokenContainer ) => {
    const { req, res } = tokenContainer;
    const canStore = this.refreshConfig.canStore(req);
    if(!canStore) return;
    res.toSend = res.toSend instanceof Object
    ? {...res.toSend, [this.refreshConfig.name]: refreshToken}
    : { [this.refreshConfig.name]: refreshToken }
  }

  setTokens = ( tokens, tokenContainer ) => {
    const { accessToken, refreshToken } = tokens
    this.setAccessToken(accessToken, tokenContainer);
    this.setRefreshToken(refreshToken, tokenContainer);
  }

  getAccessToken = (req) => req.body[this.accessConfig.name]

  getRefreshToken = (req) => req.body[this.refreshConfig.name]

  getTokens = (req) => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
