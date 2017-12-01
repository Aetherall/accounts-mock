import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

type JWTsignOptions = {
    algorithm?: string;
    expiresIn?: string;
    notBefore?: string;
}

type TokenGenerationParameters = {
    sessionId?: string;
    isImpersonated?: string;
}

const defaultTokenConfig = {
    algorithm:null,
    expiresIn:null,
    notBefore:null,
    audience:null,
    jwtid:null,
    subject:null,
    noTimestamp:null,
    header:null,
    keyid:null,
}

const defaultAccessTokenConfig = {
    expiresIn:'90m',
}

const defaultRefreshTokenConfig = {
    expiresIn: '7d',
}

class TokenManager {

    private secret: string;
    private accessTokenConfig: TokenGenerationConfiguration;
    private refreshTokenConfig: TokenGenerationConfiguration;

    constructor( config: TokenManagerConfiguration ){
        this.secret = config.secret;
        this.accessTokenConfig = { ...defaultTokenConfig, ...defaultAccessTokenConfig, ...config.accessToken };
        this.refreshTokenConfig = { ...defaultTokenConfig, ...defaultRefreshTokenConfig, ...config.refreshToken };
    }

    generateRandom = ( length: number = 43 ) => randomBytes(length).toString('hex');

    generateAccess = ( data: TokenGenerationParameters ) => jwt.sign({ data }, this.secret, this.accessTokenConfig);

    generateRefresh = ( data: TokenGenerationParameters ) => jwt.sign({ data }, this.secret, this.refreshTokenConfig);

    decode = async ( token: string, ignoreExpiration: boolean = false ) => 
        await jwt.verify(token, this.secret, { ignoreExpiration } )
        .catch( ( err: Error ) => { throw new AccountsError(' [ Accounts - TokenManager ] Token is invalid ') } )
}