import { TokenTransport } from "../../Types/TokenTransport";
import { Tokens } from "../../Types/Tokens";


export default class TokenTransportManager implements TokenTransport {
  
    private tokenTransports: TokenTransport[];
  
    constructor( ...tokenTransports: TokenTransport[] ){
  
      this.tokenTransports = tokenTransports
    }
  
    setAccessToken = ( accessToken: string, transportContainer: object ) : void => 
      this.tokenTransports.forEach( ( tokenTransport: TokenTransport ) => tokenTransport.setAccessToken(accessToken, transportContainer) )
  
    setRefreshToken = ( refreshToken: string, transportContainer: object ) : void =>
      this.tokenTransports.forEach( ( tokenTransport: TokenTransport ) => tokenTransport.setRefreshToken(refreshToken, transportContainer) )
  
    setTokens = ( { accessToken, refreshToken } : Tokens, transportContainer: object) : void => {
      this.setAccessToken(accessToken, transportContainer);
      this.setRefreshToken(refreshToken, transportContainer);
    }
  
    getAccessToken = ( transportContainer: object ) : string | null => this.tokenTransports.reduce(
      ( a: string | null, tokenTransport: TokenTransport ) =>
      {
        const temp: any = tokenTransport.getAccessToken(transportContainer);
        return typeof temp === "string" && temp.length > 0 ? temp : a
      }
      , null
    )
  
  
    getRefreshToken = ( transportContainer: object ) : string | null => this.tokenTransports.reduce( 
      ( a: string | null, tokenTransport: TokenTransport ) =>
      {
        const temp: any = tokenTransport.getRefreshToken(transportContainer);
        return typeof temp === "string" && temp.length > 0 ? temp : a
      }
      , null
    )
  
    getTokens = ( transportContainer: object ) : Tokens => ({
      accessToken: this.getAccessToken(transportContainer),
      refreshToken: this.getRefreshToken(transportContainer)
    })
  }