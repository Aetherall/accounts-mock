import { TokenTransport } from "../Types/TokenTransport";
import { ETTBConfiguration } from "./Types/ETTBConfiguration";
import { ETTBTokenConfiguration } from "./Types/ETTBTokenConfiguration";
import { Tokens } from "../Types/Tokens";


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

class ExpressTokenTransportBody implements TokenTransport {

  public accessConfig: ETTBTokenConfiguration;
  public refreshConfig: ETTBTokenConfiguration;

  constructor( config: ETTBConfiguration ) {

    this.accessConfig = { ...defaultConfig.access, ...config.access };

    this.refreshConfig = { ...defaultConfig.refresh, ...config.refresh };

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
