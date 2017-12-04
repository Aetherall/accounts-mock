import { AuthenticationProviderOAuth } from '../../Types/AuthenticationProviderOAuth';

import * as requestPromise from 'request-promise';

export default class AuthenticationProviderOAuthFacebook implements AuthenticationProviderOAuth {

  public name: string = 'facebook';

  constructor(){

  }

  authenticate = async (params) => {
    if (!params.access_token) {
      throw new Error('No access token provided');
    }
    const user = await requestPromise({
      method: 'GET',
      json: true,
      uri: 'https://graph.facebook.com/v2.9/me',
      qs: { access_token: params.access_token },
    });
    // TODO get user email and save it
    return {
      id: user.id,
      name: user.name,
    };
  }
}