import { Router } from 'express';



class OauthRestServer {
  constructor(){

  }

  router = () => {
    const router = Router();
    router.get(`${path}/oauth/:provider/callback`, this.callback)
  }

  callback = async (req, res) => {
    const userAgent = getUserAgent(req);
    const ip = requestIp.getClientIp(req);

    const loggedInUser = await accountsServer.loginWithService('oauth', { ...req.params, ...req.query }, { ip, userAgent });

  }

}