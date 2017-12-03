import { RefreshTokenPayload } from "../../Types/RefreshTokenPayload";
import { TokenPayload } from "../../Types/TokenPayload";


export interface TokenManagerInterface {

  generateAccess({ sessionId, isImpersonated} ?: { sessionId?: string, isImpersonated?: boolean }) : string;

  generateRefresh({ sessionId, isImpersonated} ?: { sessionId?: string, isImpersonated?: boolean }) : string;

  generateRandom( length: number ) : string;

  decode( token: string, ignoreExpiration?: boolean) : Promise <TokenPayload>;
  
}