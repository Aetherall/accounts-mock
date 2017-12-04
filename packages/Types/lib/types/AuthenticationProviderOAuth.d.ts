export interface AuthenticationProviderOAuth {
    name: string;
    authenticate(params: any): any;
}
export interface AuthenticationProvidersOAuth {
    [providerName: string]: AuthenticationProviderOAuth;
}
