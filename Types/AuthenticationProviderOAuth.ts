export interface AuthenticationProviderOAuth {

  name: string;

  authenticate( params ) : any

}

export interface AuthenticationProvidersOAuth {

  [ providerName: string ] : AuthenticationProviderOAuth;

}