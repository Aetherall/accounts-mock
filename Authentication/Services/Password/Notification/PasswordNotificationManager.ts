class PasswordNotificationManager {
  private notificationServices;
  constructor(notificationServices){
    this.notificationServices = notificationServices.reduce(
      (a, notificationService) => a[notificationService.name] = notificationService
    ,{})
  }


  sendEnroll = (notificationService, params) => this.notificationServices[notificationService](params)

  sendResetPassword = (notificationService, params) => this.notificationServices[notificationService](params)

  sendVerification = (notificationService, params) => this.notificationServices[notificationService](params)
}