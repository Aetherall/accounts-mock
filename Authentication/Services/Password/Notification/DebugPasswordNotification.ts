class DebugPasswordNotification implements PasswordNotificationInterface {
  
  constructor(config){
    this.name = 'email';
  }

  sendEnroll = (params) => {
    const { address, user, token } = params;
    console.log(`[ Accounts - Notification ] sendEnroll : { address: ${address}, userId: ${user.id}, token: ${token} }`)
  }
  
  sendResetPassword = (params) => {
    const { address, user, token } = params;
    console.log(`[ Accounts - Notification ] sendResetPassword : { address: ${address}, userId: ${user.id}, token: ${token} }`)
  }
  
  sendVerification = (params) => {
    const { address, user, token } = params;
    console.log(`[ Accounts - Notification ] sendVerification : { address: ${address}, userId: ${user.id}, token: ${token} }`)
  }
}