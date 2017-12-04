import { AuthenticationOAuthProvider } from '@types/accounts';
export default class AuthenticationOAuthProviderFacebook implements AuthenticationOAuthProvider {
    name: string;
    constructor();
    authenticate: (params: any) => Promise<{
        id: any;
        name: any;
    }>;
}
