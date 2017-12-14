
export interface CookieDirectives {
  secure?: boolean,
  httpOnly?: boolean,
  expires?: number,
  maxAge?: Date,
  domain?: boolean | string,
  path?: string,
  sameSite?: string
}