import { TokenTransport, Tokens } from 'accounts';

import { merge } from 'lodash';

import { Configuration } from "./types/Configuration"
import { TokenConfiguration } from "./types/TokenConfiguration"

const defaultConfig: Configuration  = {
  access: {
    name: 'accessToken',
    canStore: () => true,
    secure: true,
    httpOnly: true,
    expires: new Date( new Date().getTime() + (1000*60*20)),
    maxAge: 1000*60*20,
    domain: false,
    path: '/',
    sameSite: 'Strict'
  },
  refresh: {
    name: 'refreshToken',
    canStore: () => true,
    secure: true,
    httpOnly: true,
    expires: new Date( new Date().getTime() + (1000*60*20)),
    maxAge: 1000*60*20,
    domain: false,
    path: '/',
    sameSite: 'Strict'
  }
}

export default class TokenTransportExpressCookies implements TokenTransport {

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

  getAccessToken = ( req: any ) : string | undefined => req.cookies[this.accessConfig.name]

  getRefreshToken = ( req: any ) : string | undefined => req.cookies[this.refreshConfig.name]

  getTokens = ( req: any ) : Tokens => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
