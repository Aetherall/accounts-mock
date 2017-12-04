import { ETTBConfiguration } from "../types/ETTBConfiguration";
import { TokenTransport } from "../../Types/TokenTransport";
import { ETTBTokenConfiguration } from "../types/ETTBTokenConfiguration";
import { Tokens } from "../../Types/Tokens";
import { merge } from "lodash";



const defaultConfig: ETTBConfiguration = {
  access: {
    name: 'accessToken',
    canStore: () => true
  },
  refresh: {
    name: 'refreshToken',
    canStore: () => true
  }
}

export default class ExpressTokenTransportBody implements TokenTransport {

  public accessConfig: ETTBTokenConfiguration;
  public refreshConfig: ETTBTokenConfiguration;

  constructor( config: ETTBConfiguration ) {
    const configuration = merge({}, defaultConfig, config)
    
    this.accessConfig = configuration.access;

    this.refreshConfig = configuration.refresh

  }

  setAccessToken = ( accessToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.accessConfig.canStore(req);

    if(!canStore) return;

    res.toSend = res.toSend
    ? {...res.toSend, [this.accessConfig.name]: accessToken}
    : { [this.accessConfig.name]: accessToken }

  }

  setRefreshToken = ( refreshToken: string, { req, res } : any ) : void => {

    const canStore: boolean = this.refreshConfig.canStore(req);

    if(!canStore) return;

    res.toSend = res.toSend
    ? {...res.toSend, [this.refreshConfig.name]: refreshToken}
    : { [this.refreshConfig.name]: refreshToken }

  }

  setTokens = ( { accessToken, refreshToken } : Tokens, tokenContainer: any ) : void => {

    this.setAccessToken(accessToken, tokenContainer);

    this.setRefreshToken(refreshToken, tokenContainer);

  }

  getAccessToken = ( req: any ) : string | undefined => req.body[this.accessConfig.name]

  getRefreshToken = ( req: any ) : string | undefined => req.body[this.refreshConfig.name]

  getTokens = ( req: any ) : Tokens => ({
    accessToken: this.getAccessToken(req),
    refreshToken: this.getRefreshToken(req)
  })

}
