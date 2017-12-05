export interface AuthenticationOAuthProvider {

  name: string;

  authenticate( params ) : any

}

export interface AuthenticationOAuthProviders {

  [ providerName: string ] : AuthenticationOAuthProvider;

}