import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { TokenGenerationConfiguration } from './Types/TokenGenerationConfiguration';
import { TokenManagerConfiguration } from './Types/TokenManagerConfiguration';
import { TokenManagerInterface } from './Types/TokenManagerInterface';

type JWTsignOptions = {
    algorithm?: string;
    expiresIn?: string;
    notBefore?: string;
}

interface TokenGenerationParameters {
    sessionId?: string;
    isImpersonated?: boolean;
}

const defaultTokenConfig: TokenGenerationConfiguration = {
    algorithm:null,
    expiresIn:null,
    notBefore:null,
    audience:null,
    /*jwtid:null,
    subject:null,
    noTimestamp:null,
    header:null,
    keyid:null,*/
}

const defaultAccessTokenConfig: TokenGenerationConfiguration = {
    expiresIn:'90m',
}

const defaultRefreshTokenConfig: TokenGenerationConfiguration = {
    expiresIn: '7d',
}

class TokenManager implements TokenManagerInterface {

    private secret: string;
    private accessTokenConfig: TokenGenerationConfiguration;
    private refreshTokenConfig: TokenGenerationConfiguration;

    constructor( config: TokenManagerConfiguration ){
        this.secret = config.secret;
        this.accessTokenConfig = { ...defaultTokenConfig, ...defaultAccessTokenConfig, ...config.access };
        this.refreshTokenConfig = { ...defaultTokenConfig, ...defaultRefreshTokenConfig, ...config.refresh };
    }

    generateRandom = ( length: number = 43 ) => randomBytes(length).toString('hex');

    generateAccess = ( data: TokenGenerationParameters = {} ) => jwt.sign({ data }, this.secret, this.accessTokenConfig);

    generateRefresh = ( data: TokenGenerationParameters = {} ) => jwt.sign({ data }, this.secret, this.refreshTokenConfig);

    decode = async ( token: string, ignoreExpiration: boolean = false ) => 
        await jwt.verify(token, this.secret, { ignoreExpiration } )
        .catch( ( err: Error ) => { throw new AccountsError(' [ Accounts - TokenManager ] Token is invalid ') } )
}