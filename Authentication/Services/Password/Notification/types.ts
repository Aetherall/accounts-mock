
interface NotificationParams {
  destination: string;
  user: User;
  token: string;
}

interface PasswordNotificationInterface {
  sendEnroll( params: NotificationParams ) : void;
  sendResetPassword( params: NotificationParams ) : void;
  sendVerification( params: NotificationParams ) : void;
}