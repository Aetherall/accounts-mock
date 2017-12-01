

class TokenTransportManager {

  private tokenTransports: TokenTransport[];

  constructor( ...tokenTransports: TokenTransport[] ){

    this.tokenTransports = tokenTransports
  }

  setAccessToken = ( ...params: any[] ) : void => 
    this.tokenTransports.forEach( ( tokenTransport: TokenTransport ) => tokenTransport.setAccessToken(...params) )

  setRefreshTokens = ( ...params: any[] ) : void =>
    this.tokenTransports.forEach( ( tokenTransport: TokenTransport ) => tokenTransport.setRefreshToken(...params) )

  setTokens = ( tokens: Tokens, transportContainer: any) : void => {
    const { accessToken, refreshToken } = tokens;
    this.setAccessToken(accessToken, transportContainer);
    this.setRefreshTokens(refreshToken, transportContainer);
  }

  getAccessToken = ( ...params: any[] ) : string | null => this.tokenTransports.reduce(
    ( a: string | null, tokenTransport: TokenTransport ) =>
    {
      const temp: any = tokenTransport.getAccessToken(...params);
      return temp instanceof String && temp.length > 0 ? temp : a
    }
    , null
  )


  getRefreshToken = (...params: any[] ) : string | null => this.tokenTransports.reduce( 
    ( a: string | null, tokenTransport: TokenTransport ) =>
    {
      const temp: any = tokenTransport.getRefreshToken(...params);
      return temp instanceof String && temp.length > 0 ? temp : a
    }
    , null
  )

  getTokens = (...params: any[] ) : Tokens => ({
    accessToken: this.getAccessToken(...params),
    refreshToken: this.getRefreshToken(...params)
  })
}