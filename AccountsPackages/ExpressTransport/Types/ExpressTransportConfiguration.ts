import { TokenTransport } from "../../Types/TokenTransport";

export interface ExpressTransportConfiguration {
  
  tokenTransport: TokenTransport;

  accountsServer?: AccountsServer;

  path?: string;

  

}