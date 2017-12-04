import { TokenTransport } from "@types/accounts";

import AccountsServer from "@accounts/server";

export interface ExpressTransportConfiguration {
  
  tokenTransport: TokenTransport;

  accountsServer?: AccountsServer;

  path?: string;

  

}