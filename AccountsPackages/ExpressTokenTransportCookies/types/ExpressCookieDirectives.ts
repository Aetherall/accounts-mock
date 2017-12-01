
export interface ExpressCookieDirectives {
  secure?: boolean,
  httpOnly?: boolean,
  expires?: string,
  maxAge?: string,
  domain?: boolean | string,
  path?: string,
  sameSite?: string
}