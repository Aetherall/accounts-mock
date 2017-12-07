import { TokenTransport, Tokens } from 'accounts';

import { Configuration } from "./types/Configuration"
import { TokenConfiguration } from "./types/TokenConfiguration"

const defaultConfig: Configuration  = {
  access: {
    name: 'accessToken',
    canStore: () => true,
    secure: true,
    httpOnly: true,
    expires: '1d',
    maxAge: '1d',
    domain: false,
    path: '/',
    sameSite: 'Strict'
  },
  refresh: {
    name: 'refreshToken',
    canStore: () => true,
    secure: true,
    httpOnly: true,
    expires: '1d',
    maxAge: '1d',
    domain: false,
    path: '/',
    sameSite: 'Strict'
  }
}

export default class TokenTransportExpressCookies implements TokenTransport {

  public accessConfig: TokenConfiguration;
  public refreshConfig: TokenConfiguration;

  constructor( config: Configuration ) {

    this.accessConfig = { ...defaultConfig.access, ...config.access }

    this.refreshConfig = { ...defaultConfig.refresh, ...config.refresh }

  }

  setAccessToken = ( accessToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.accessConfig.canStore(req);

    if(!canStore) return;

    const { name, ...accessConfig } = this.accessConfig;

    res.cookie(name, accessToken, accessConfig)

  }

  setRefreshToken = ( refreshToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.refreshConfig.canStore(req);

    if(!canStore) return;

    const { name, ...refreshConfig } = this.refreshConfig;

    res.cookie(name, refreshToken, refreshConfig)

  }

  setTokens = ( { accessToken, refreshToken } : Tokens , tokenContainer: any ) : void => {

    this.setAccessToken(accessToken, tokenContainer);

    this.setRefreshToken(refreshToken, tokenContainer);

  }

  getAccessToken = ( req: any ) : string | undefined => req.cookie[this.accessConfig.name]

  getRefreshToken = ( req: any ) : string | undefined => req.cookie[this.refreshConfig.name]

  getTokens = ( req: any ) : Tokens => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
