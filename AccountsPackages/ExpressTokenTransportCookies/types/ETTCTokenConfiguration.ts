import { ExpressCookieDirectives } from "./ExpressCookieDirectives";

export interface ETTCTokenConfiguration extends ExpressCookieDirectives {
  name: string;
  canStore( req: any ) : boolean; 
}