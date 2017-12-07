import { TokenGenerationConfiguration } from "./TokenGenerationConfiguration";

export interface TokenManagerConfiguration {
  
  secret: string;

  emailTokensExpiration?: number;

  access?: TokenGenerationConfiguration;

  refresh?: TokenGenerationConfiguration

}