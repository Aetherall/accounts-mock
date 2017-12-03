import { TokenTransport } from "../../Types/TokenTransport";
import AccountsServer from "../../AccountsServer/src/AccountsServer";

export interface ExpressTransportConfiguration {
  
  tokenTransport: TokenTransport;

  accountsServer?: AccountsServer;

  path?: string;

  

}