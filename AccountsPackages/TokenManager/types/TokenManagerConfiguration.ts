export interface TokenManagerConfiguration {
  
  secret: string;

  access: TokenGenerationConfiguration;

  refresh: TokenGenerationConfiguration

}