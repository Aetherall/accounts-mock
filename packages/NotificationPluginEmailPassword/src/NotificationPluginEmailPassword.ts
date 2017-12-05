import { User, NotificationPlugin } from 'accounts';

import { NotificationPluginEmailPasswordConfiguration } from './types/NotificationPluginEmailPasswordConfiguration';
import { merge } from 'lodash';

const defaultConfig: NotificationPluginEmailPasswordConfiguration = {
  from: null
}

export default class NotificationPluginEmailPassword implements NotificationPlugin {

  public name: string = 'password';

  private from: string | null;

  constructor( config?: NotificationPluginEmailPasswordConfiguration ){
    const configuration = merge({}, defaultConfig, config);
    this.from = configuration.from;

  }


  enroll = ( send: Function ) => ( { address, user, token }: { address: string, user: User, token: string } ) => {

    const mail = {
      from : this.from,
      to: address,
      subject: 'Set your password',
      text: `To set your password please click on this link: ${token}`
    }

    send(mail);

  }

  resetPassword = ( send: Function ) => ( { address, user, token }: { address: string, user: User, token: string } ) => {

    const mail = {
      from : this.from,
      to: address,
      subject: 'Reset your password',
      text: `To reset your password please click on this link: ${token}`
    }

    send(mail);

  }

  verification = ( send: Function ) => ( { address, user, token }: { address: string, user: User, token: string } ) => {

    const mail = {
      from : this.from,
      to: address,
      subject: 'Verify your account email',
      text: `To verify your account email please click on this link: ${token}`
    }

    send(mail);
  }

}