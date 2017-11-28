
class ExpressTTSHeaders {
  public accessToken
  public refreshToken

  constructor(config) {
    this.accessToken = config.access || 'accessToken';
    this.refreshToken = config.refresh || 'refreshToken';
  }

  setAccessToken = (res, accessToken) => {
    res.set(this.accessToken, accessToken)
  }

  setRefreshToken = (res, refreshToken) => {
    res.set(this.refreshToken, refreshToken)
  }

  getAccessToken = (req) => req.cookie[this.accessToken]

  getRefreshToken = (req) => req.cookie[this.refreshToken]

}
