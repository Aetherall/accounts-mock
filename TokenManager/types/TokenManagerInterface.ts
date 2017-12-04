import { RefreshTokenPayload } from "../../Types/RefreshTokenPayload";
import { TokenPayload } from "../../Types/TokenPayload";
import { TokenRecord } from "../../Types/TokenRecord";


export interface TokenManagerInterface {

  generateAccess({ sessionId, isImpersonated} ?: { sessionId?: string, isImpersonated?: boolean }) : string;

  generateRefresh({ sessionId, isImpersonated} ?: { sessionId?: string, isImpersonated?: boolean }) : string;

  generateRandom( length?: number ) : string;

  isTokenExpired( token: string, tokenRecord?: TokenRecord ): boolean

  decode( token: string, ignoreExpiration?: boolean) : Promise <TokenPayload>;
  
}