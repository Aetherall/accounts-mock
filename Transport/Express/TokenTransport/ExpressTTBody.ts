
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

  setAccessToken = (req, res, accessToken) => {

    const canStore = this.accessConfig.canStore(req);

    if(!canStore) return;

    res.jsonToSend = res.jsonTonSend instanceof Object
    ? {...res.jsonToSend, [this.accessConfig.name]: accessToken}
    : { [this.accessConfig.name]: accessToken }
  }

  setRefreshToken = (req, res, refreshToken) => {

    const canStore = this.refreshConfig.canStore(req);

    if(!canStore) return;

    res.jsonToSend = res.jsonTonSend instanceof Object
    ? {...res.jsonToSend, [this.refreshConfig.name]: refreshToken}
    : { [this.refreshConfig.name]: refreshToken }
  }

  setTokens = (req, res, tokens) => {
    const { accessToken, refreshToken } = tokens

    this.setAccessToken(req, res, accessToken);
    this.setRefreshToken(req, res, refreshToken);
  }

  getAccessToken = (req) => req.body[this.accessConfig.name]

  getRefreshToken = (req) => req.body[this.refreshConfig.name]

  getTokens = (req) => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
