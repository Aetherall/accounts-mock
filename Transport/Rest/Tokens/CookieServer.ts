


const defaultCookieDirectives = {
    secure:true,
    httpOnly:true,
    expires:'1d',
    maxAge:'1d',
    domain:false,
    path:'/',
    sameSite:'Strict'
}

const defaultCookieServerConfiguration = {
    access:{
        name: 'accessToken',
        ...defaultCookieDirectives
    },
    refresh:{
        name: 'refreshToken',
        ...defaultCookieDirectives
    }
}

class CookieServer {

    private accessCookieconfig;
    private refreshCookieconfig;

    constructor(config){
        this.accessCookieconfig = { ...defaultCookieServerConfiguration.access, ...config.accessCookie }
        this.refreshCookieconfig = { ...defaultCookieServerConfiguration.refresh, ...config.refreshCookie }
    }

    setToken = (res, tokens) => {
        const { accessToken, refreshToken } = tokens

        if(accessToken){
            const { name: accessCookieName ,...accessCookieConfig } = this.accessCookieconfig;
            res.cookie(accessCookieName, accessToken, accessCookieConfig);
        }

        if(refreshToken) {
            const { name: refreshCookieName ,...refreshCookieConfig } = this.refreshCookieconfig;
            res.cookie(refreshCookieName, refreshToken, refreshCookieConfig);
        }

        return {}
    }
}