import { TokenPayload } from '../../Types/TokenPayload';
import { RefreshTokenPayload } from '../../Types/RefreshTokenPayload';

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
    private accessTokenConfig: TokenGenerationConfiguration;
    private refreshTokenConfig: TokenGenerationConfiguration;

    constructor( config: TokenManagerConfiguration ){
        this.secret = config.secret;
        this.accessTokenConfig = { ...defaultTokenConfig, ...defaultAccessTokenConfig, ...config.access };
        this.refreshTokenConfig = { ...defaultTokenConfig, ...defaultRefreshTokenConfig, ...config.refresh };
    }

    generateRandom = ( length: number = 43 ) => randomBytes(length).toString('hex');

    generateAccess = ( data: TokenPayload ) => jwt.sign({ data }, this.secret, this.accessTokenConfig);

    generateRefresh = ( data: TokenPayload = {} ) => jwt.sign({ data }, this.secret, this.refreshTokenConfig);

    decode = async ( token: string, ignoreExpiration: boolean = false ) : Promise <TokenPayload> => 
        await jwt.verify(token, this.secret, { ignoreExpiration } )
        .catch( ( err: Error ) => { throw new Error(' [ Accounts - TokenManager ] Token is invalid ') } )
}