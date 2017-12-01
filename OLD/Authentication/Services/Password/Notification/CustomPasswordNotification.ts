class CustomPasswordNotification implements PasswordNotificationInterface {

  constructor(config){
    this.name = config.name;
    this.sendEnroll = config.sendEnroll;
    this.sendResetPassword = config.sendResetPassword;
    this.sendVerification = config.sendVerification;
  }

}