import mailgun from 'mailgun-js';

class MailgunPasswordNotification implements PasswordNotificationInterface {

  private from;
  private mailgun;
  private name;

  constructor(config){
    this.name = 'email';
    this.from = config.from || 'Accounts.JS <no-reply@accounts-js.com>';
    this.mailgun = config.mailgun || mailgun({ apiKey: config.apiKey, domain: config.domain });
  }

  sendEnroll = (params) => {
    const { address, user, token } = params;
    const mail = {
      from : this.from,
      to: address,
      subject: 'Set your password',
      text: `To set your password please click on this link: ${token}`
    }
    this.mailgun.messages().send(mail)
  }
  
  sendResetPassword = (params) => {
    const { address, user, token } = params;
    const mail = {
      from : this.from,
      to: address,
      subject: 'Reset your password',
      text: `To reset your password please click on this link: ${token}`
    }
    this.mailgun.messages().send(mail)
  }
  
  sendVerification = (params) => {
    const { address, user, token } = params;
    const mail = {
      from : this.from,
      to: address,
      subject: 'Verify your account email',
      text: `To verify your account email please click on this link: ${token}`
    }
    this.mailgun.messages().send(mail)
  }
}