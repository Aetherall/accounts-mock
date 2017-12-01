
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
  public accessConfig: ExpressTTBodyTokenConfiguration;
  public refreshConfig: ExpressTTBodyTokenConfiguration;

  constructor( config: ExpressTTBodyConfiguration ) {
    this.accessConfig = { ...defaultConfig.access, ...config.access };
    this.refreshConfig = { ...defaultConfig.refresh, ...config.refresh };
  }

  setAccessToken = ( accessToken: string, tokenContainer: any ) : void => {
    const { req, res } = tokenContainer;
    const canStore: boolean = this.accessConfig.canStore(req);
    if(!canStore) return;
    res.toSend = res.toSend instanceof Object
    ? {...res.toSend, [this.accessConfig.name]: accessToken}
    : { [this.accessConfig.name]: accessToken }
  }

  setRefreshToken = ( refreshToken: string, tokenContainer: any ) : void => {
    const { req, res } = tokenContainer;
    const canStore: boolean = this.refreshConfig.canStore(req);
    if(!canStore) return;
    res.toSend = res.toSend instanceof Object
    ? {...res.toSend, [this.refreshConfig.name]: refreshToken}
    : { [this.refreshConfig.name]: refreshToken }
  }

  setTokens = ( tokens: Tokens, tokenContainer: any ) : void => {
    const { accessToken, refreshToken } = tokens
    this.setAccessToken(accessToken, tokenContainer);
    this.setRefreshToken(refreshToken, tokenContainer);
  }

  getAccessToken = ( req: any ) : string => req.body[this.accessConfig.name]

  getRefreshToken = ( req: any ) : string => req.body[this.refreshConfig.name]

  getTokens = ( req: any ) : Tokens => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
