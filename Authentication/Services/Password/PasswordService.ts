class PasswordService {
  private accountsServer;
  private databaseInterface;
  private tokenManager;

  private passwordNotificationManager;

  constructor(config){
    this.passwordNotificationManager = config.passwordNotificationManager;
  }

  useService = (target, params, connectionInfo) => {
    
    const actionName = target.action;

    const action = this[actionName];

    if(!action) throw new AccountsError(`[ Accounts - Password ] useService : No action matches ${actionName} `)

    return action( params, connectionInfo )
  }

  public register = async (params) => {

    const { username, email, password } = params;

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

    return { userId }
  }


  public verifyEmail = async (params) => {

    const { token } = params;

    const user = await this.databaseInterface.findUserByEmailVerificationToken(token);
    if (!user) { throw new Error('Verify email link expired') }

    const verificationTokens = get(user,'services.email.verificationTokens', []);

    const tokenRecord = verificationTokens.find( t => t.token === token );

    const emailRecord = user.emails.find( e => e.address === tokenRecord.address );

    if(!emailRecord) throw new Error('Verify email link is for unknown address');

    await this.databaseInterface.verifyEmail(user.id, emailRecord.address);

    return { message: 'Email verified' }
  }

  public resetPassword = async (params) => {

    const { token, newPassword } = params;

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

    return { message:'Password Changed' }
  }

  public sendVerificationEmail = async (params) => {

    const { address } = params;

    if(!address) throw new Error('Invalid email');

    const user = await this.databaseInterface.findUserByEmail(address);

    if (!user) throw new Error('User not found');

    const emails = user.emails || [];

    if (!emails.find( e => e.address === address )) throw new Error('No such email address for user');

    const token = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addEmailVerificationToken(user.id, address, token);

    await this.passwordNotificationManager.sendVerify('email',  { address, user, token });
    
    return { message: 'Email Sent' }

  }

  public sendResetPasswordEmail = async (params) => {

    const address = params;

    if(!address) throw new Error('Invalid email');

    const user = await this.databaseInterface.findUserByEmail(address);
    
    if (!user) throw new Error('User not found');

    const email = getFirstUserEmail(user, address);

    const token = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addResetPasswordToken(user.id, address, token);

    await this.passwordNotificationManager.sendVerify('email',  { address, user, token });

    return { message:'email sent' }

  }

  public authenticate = async (params, connectionInfo) => {
    
    const { username, email, userId, password } = params;

    if(!username && !email && !userId) throw new Error('Username, Email or userId is Required');

    // Fetch the user from database
    const user = userId ? await this.databaseInterface.findUserById(userId)
      : username ? await this.databaseInterface.findUserByUsername(username)
      : email ? await this.databaseInterface.findUserByEmail(email)
      : null

    if(!user) throw new Error('User Not Found');

    const hash = await this.databaseInterface.findPasswordHash(user.id);

    if (!hash) throw new Error('User has no password set');

    const hashedPassword = this.hashAlgorithm 
      ? hashPassword(password, this.hashAlgorithm)
      : password

    const isPasswordValid = await verifyPassword(hashedPassword, hash)

    if (!isPasswordValid) throw new Error('Incorrect password');

    const loginResult = this.accountsServer.loginWithUser(user, connectionInfo);

    return loginResult
  }
}