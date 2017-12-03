import { TokenTransport } from "../../Types/TokenTransport";
import { Tokens } from "../../Types/Tokens";

import { ETTHConfiguration } from "../types/ETTHConfiguration";
import { ETTHTokenConfiguration } from "../types/ETTHTokenConfiguration";


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


export default class ExpressTokenTransportHeaders implements TokenTransport {

  public accessConfig: ETTHTokenConfiguration;
  public refreshConfig: ETTHTokenConfiguration;

  constructor( config: ETTHConfiguration ) {

    this.accessConfig = { ...defaultConfig.access, ...config.access };

    this.refreshConfig = { ...defaultConfig.refresh, ...config.refresh };

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
