class PasswordServer {
  private accountsServer;
  private databaseInterface;
  private tokenManager;

  constructor(){

  }

  link = (accountsServer) => {
    this.accountsServer = accountsServer;
    this.databaseInterface = accountsServer.databaseInterface;
  }

  public register = async (register) => {
    const { username, email, password } = register;

    if (!this.validateUsername(username) && !this.validateEmail(email)) throw new Error('Username or Email is required');

    if (username && (await this.databaseInterface.findUserByUsername(username))) throw new Error('Username already exists');

    if (email && (await this.databaseInterface.findUserByEmail(email))) throw new Error('Email already exists');

    const newUser = {
      username,
      email,
      password: password ? await this.hashAndBcryptPassword(password) : null
    }

    const newUserValid = await this.config.validateNewUser(newUser);

    if (!newUserValid) throw new Error('User Invalid')

    const userId = this.databaseInterface.createUser(newUser);

    return userId
  }


  public verifyEmail = async (token) => {

    const user = await this.databaseInterface.findUserByEmailVerificationToken(token);
    if (!user) { throw new Error('Verify email link expired') }

    const verificationTokens = get(user,'services.email.verificationTokens', []);

    const tokenRecord = verificationTokens.find( t => t.token === token );

    const emailRecord = user.emails.find( e => e.address === tokenRecord.address );

    if(!emailRecord) throw new Error('Verify email link is for unknown address');

    await this.databaseInterface.verifyEmail(user.id, emailRecord.address);

  }

  public resetPassword = async (token, newPassword) => {

    const user = await this.databaseInterface.findUserByResetPasswordToken(token);

    if (!user) throw new Error('Reset password link expired');


    // TODO move this getter into a password service module

    const resetTokens = get(user,'services.password.reset', []);
    const resetTokenRecord = resetTokens.find( t => t.token === token )

    if (this.server.isTokenExpired(token, resetTokenRecord)) {
      throw new Error('Reset password link expired');
    }

    const emails = user.emails || [];

    if(!emails.find( e => e.address === resetTokenRecord.address )) throw new Error('Token has invalid email address')
    
    const password = await this.hashAndBcryptPassword(newPassword);

    // Change the user password and remove the old token
    await this.databaseInterface.setResetPassword(
      user.id,
      resetTokenRecord.address,
      password,
      token
    );

    // Changing the password should invalidate existing sessions
    this.databaseInterface.invalidateAllSessions(user.id);
  }

  public sendVerificationEmail = async (address) => {

    if(!address) throw new Error('Invalid email');

    const user = await this.databaseInterface.findUserByEmail(address);

    if (!user) throw new Error('User not found');

    const emails = user.emails || [];

    if (!emails.find( e => e.address === address )) throw new Error('No such email address for user');

    const token = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addEmailVerificationToken(user.id, address, token);

    const emailNotificationService = this.accountsServer.notification.getService('email');



    const verifyEmailMail = emailNotificationService.prepareTemplate(verifyEmail, { address, user, token });

    await emailNotificationService.send(verifyEmailMail);
    /*const resetPasswordMail = this.accountsServer.prepareMail(
      address,
      token,
      this.server.sanitizeUser(user),
      'verify-email',
      this.server.options.emailTemplates.verifyEmail,
      this.server.options.emailTemplates.from
    );*/

  }

  public sendResetPasswordEmail = async (address) => {
    if(!address) throw new Error('Invalid email');

    const user = await this.databaseInterface.findUserByEmail(address);
    
    if (!user) throw new Error('User not found');

    const email = getFirstUserEmail(user, address);

    const token = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addResetPasswordToken(user.id, address, token);

    const resetPasswordMail = emailNotificationService.prepareTemplate(resetPassword, { address, user, token });
    
    await emailNotificationService.send(resetPasswordMail);

  }

  public authenticate = async () => {
    
  }
}