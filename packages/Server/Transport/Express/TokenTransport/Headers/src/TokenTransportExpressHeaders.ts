import { TokenTransport, Tokens } from 'accounts';

import { merge } from 'lodash';

import { Configuration } from "./types/Configuration";
import { TokenConfiguration } from "./types/TokenConfiguration";


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


export default class TokenTransportExpressHeaders implements TokenTransport {

  public accessConfig: TokenConfiguration;
  public refreshConfig: TokenConfiguration;

  constructor( config?: Configuration ) {
    
    const access = config && config.access || {}
    const refresh = config && config.refresh || {}

    this.accessConfig = merge({},defaultConfig.access, access)

    this.refreshConfig = merge({},defaultConfig.refresh, refresh)

  }

  setAccessToken = ( accessToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.accessConfig.canStore(req);

    if(!canStore) return;

    res.set(this.accessConfig.name, accessToken)

  }

  setRefreshToken = ( refreshToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.refreshConfig.canStore(req);

    if(!canStore) return;

    res.set(this.refreshConfig.name, refreshToken)

  }

  setTokens = ({ accessToken, refreshToken } : Tokens, tokenContainer: any ) : void => {

    this.setAccessToken(accessToken, tokenContainer);

    this.setRefreshToken(refreshToken, tokenContainer);

  }

  getAccessToken = ( req: any ) : string | undefined => req.get(this.accessConfig.name)

  getRefreshToken = ( req: any ) : string | undefined => req.get(this.refreshConfig.name)

  getTokens = ( req: any ): Tokens => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
