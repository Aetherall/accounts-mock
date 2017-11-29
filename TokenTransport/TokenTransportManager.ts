

class TokenTransportManager {
  private tokenTransports;

  constructor(...tokenTransports){
    this.tokenTransports = tokenTransports
  }

  setAccessToken = (...params) => 
    this.tokenTransports.forEach( tokenTransport => tokenTransport.setAccessToken(...params) )

  setRefreshTokens = (...params) =>
    this.tokenTransports.forEach( tokenTransport => tokenTransport.setRefreshToken(...params) )

  setTokens = (tokens, transportContainer) => {
    const { accessToken, refreshToken } = tokens;
    this.setAccessToken(accessToken, transportContainer);
    this.setRefreshTokens(refreshToken, transportContainer);
  }

  getAccessToken = (...params) => this.tokenTransports.reduce( ( a, tokenTransport ) => {
      const temp = tokenTransport.getAccessToken(...params);
      return temp instanceof String && temp.length > 0 ? temp : a
    }, null)

  getRefreshToken = (...params) => this.tokenTransports.reduce( ( a, tokenTransport ) => {
      const temp = tokenTransport.getRefreshToken(...params);
      return temp instanceof String && temp.length > 0 ? temp : a
    }, null)

  
  getTokens = (...params) => ({
    accessToken: this.getAccessToken(...params),
    refreshToken: this.getRefreshToken(...params)
  })
}