import { TokenPayload } from '../../Types/TokenPayload';
import { RefreshTokenPayload } from '../../Types/RefreshTokenPayload';
import { TokenRecord } from '../../Types/TokenRecord';

import { TokenGenerationConfiguration } from '../types/TokenGenerationConfiguration';
import { TokenManagerConfiguration } from '../types/TokenManagerConfiguration';
import { TokenManagerInterface } from '../types/TokenManagerInterface';

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

type JWTsignOptions = {
    algorithm?: string;
    expiresIn?: string;
    notBefore?: string;
}

const defaultTokenConfig: TokenGenerationConfiguration = {
    algorithm:undefined,
    expiresIn:undefined,
    notBefore:undefined,
    audience:undefined,
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

export default class TokenManager implements TokenManagerInterface {

    private secret: string;
    private emailTokensExpiration: number;
    private accessTokenConfig: TokenGenerationConfiguration;
    private refreshTokenConfig: TokenGenerationConfiguration;

    constructor( config: TokenManagerConfiguration ){
        this.secret = config.secret;
        this.emailTokensExpiration = config.emailTokensExpiration | 1000;
        this.accessTokenConfig = { ...defaultTokenConfig, ...defaultAccessTokenConfig, ...config.access };
        this.refreshTokenConfig = { ...defaultTokenConfig, ...defaultRefreshTokenConfig, ...config.refresh };
    }n

    generateRandom = ( length: number | undefined = 43 ) => randomBytes(length).toString('hex');

    generateAccess = ( data: TokenPayload ) => jwt.sign({ data }, this.secret, this.accessTokenConfig);

    generateRefresh = ( data: TokenPayload = {} ) => jwt.sign({ data }, this.secret, this.refreshTokenConfig);

    isTokenExpired = ( token: string, tokenRecord?: TokenRecord ): boolean => 
        !tokenRecord || Number(tokenRecord.when) + this.emailTokensExpiration < Date.now()

    decode = async ( token: string, ignoreExpiration: boolean = false ) : Promise <TokenPayload> => 
        await jwt.verify(token, this.secret, { ignoreExpiration } )
        .catch( ( err: Error ) => { throw new Error(' [ Accounts - TokenManager ] Token is invalid ') } )
}