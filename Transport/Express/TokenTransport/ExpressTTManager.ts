

class ExpressTokenTransportManager {
  private tokenTransport;

  constructor(config){
    this.tokenTransport = config.tokenTransport
  }

  setAccessToken = (req, res, accessToken) => 
    this.tokenTransport.forEach( tokenTransport => tokenTransport.setAccessToken(res, accessToken) )

  setRefreshTokens = (req, res, refreshToken) =>
    this.tokenTransport.forEach( tokenTransport => tokenTransport.setRefreshToken(res, refreshToken) )

  setTokens = (req, res, tokens) => {
    const { accessToken, refreshToken } = tokens;
    this.setAccessToken(req, res, accessToken);
    this.setRefreshTokens(req, res, refreshToken);
  }

  getAccessToken = (req) => this.tokenTransport.reduce( ( a, tokenTransport ) => {
      const temp = tokenTransport.getAccessToken(req);
      return temp instanceof String && temp.length > 0 ? temp : a
    }, null)

  getRefreshToken = (req) => this.tokenTransport.reduce( ( a, tokenTransport ) => {
      const temp = tokenTransport.getRefreshToken(req);
      return temp instanceof String && temp.length > 0 ? temp : a
    }, null)

  
  getTokens = (req) => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })
}