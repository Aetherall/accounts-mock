
interface PasswordServiceConfiguration {

  passwordNotificationManager: PasswordNotificationManager;

}


class PasswordService implements AuthenticationService {

  private accountsServer: AccountServer;

  private databaseInterface: DatabaseInterface;

  private tokenManager: TokenManager;

  private passwordNotificationManager: PasswordNotificationManager;


  constructor( config: PasswordServiceConfiguration ){

    this.passwordNotificationManager = config.passwordNotificationManager;

  }

  public useService = ( target: any, params: any, connectionInfo: ConnectionInformations ) : Promise <object> => {

    const actionName: string = target.action;

    const action: Function = this[actionName];

    if(!action) throw new AccountsError(`[ Accounts - Password ] useService : No action matches ${actionName} `)
    
    return action( params, connectionInfo )
  }

  public register = async ( params: UserPasswordRegistration ) : Promise <RegistrationResult> => {

    const { username, email, password } = params;

    if (!this.validateUsername(username) && !this.validateEmail(email)) throw new Error('Username or Email is required');

    if (username && (await this.databaseInterface.findUserByUsername(username))) throw new Error('Username already exists');

    if (email && (await this.databaseInterface.findUserByEmail(email))) throw new Error('Email already exists');

    const newUser: UserPasswordRegistration = {
      username,
      email,
      ...password && { password: await this.hashAndBcryptPassword(password) }
    }

    const newUserValid: boolean = await this.config.validateNewUser(newUser);

    if (!newUserValid) throw new Error('User Invalid')

    const userId: string = this.databaseInterface.createUser(newUser);

    const registrationResult: RegistrationResult = { userId };

    return registrationResult
  }


  public verifyEmail = async ({ token } : { token: string }) : Promise <Message> => {

    const user: User = await this.databaseInterface.findUserByEmailVerificationToken(token);

    if (!user) throw new Error('Verify email link expired');

    const verificationTokens: TokenRecord[] = get(user,'services.email.verificationTokens', []);

    const tokenRecord: TokenRecord = verificationTokens.find( ( t: TokenRecord ) => t.token === token );

    const userEmails: EmailRecord[] = user.emails;

    const emailRecord: EmailRecord = userEmails.find( ( e:EmailRecord ) => e.address === tokenRecord.address );

    if(!emailRecord) throw new Error('Verify email link is for unknown address');

    await this.databaseInterface.verifyEmail(user.id, emailRecord.address);

    const message: Message = { message: 'Email verified' }

    return message
  }

  public resetPassword = async ({ token, newPassword } : { token: string, newPassword: string }) : Promise <Message> => {

    const dbUser: User = await this.databaseInterface.findUserByResetPasswordToken(token);

    if (!dbUser) throw new Error('Reset password link expired');

    // TODO move this getter into a password service module

    const resetTokens: TokenRecord[] = get(dbUser,'services.password.reset', []);

    const resetTokenRecord: TokenRecord = resetTokens.find(( t: TokenRecord ) => t.token === token )

    if (this.server.isTokenExpired(token, resetTokenRecord)) {
      throw new Error('Reset password link expired');
    }

    const emails: EmailRecord[] = dbUser.emails || [];

    if(!emails.find( e => e.address === resetTokenRecord.address )) throw new Error('Token has invalid email address')
    
    const password: string = await this.hashAndBcryptPassword(newPassword);

    // Change the user password and remove the old token
    await this.databaseInterface.setResetPassword(
      dbUser.id,
      resetTokenRecord.address,
      password,
      token
    );

    // Changing the password should invalidate existing sessions
    this.databaseInterface.invalidateAllSessions(dbUser.id);

    const message: Message = { message:'Password Changed' }

    return message
  }

  public sendVerificationEmail = async ({ address }: { address: string }) : Promise <Message> => {

    if(!address) throw new Error('Invalid email');

    const dbUser: User = await this.databaseInterface.findUserByEmail(address);

    if (!dbUser) throw new Error('User not found');

    const emails: EmailRecord[] = dbUser.emails || [];

    if (!emails.find( ( e: EmailRecord ) => e.address === address )) throw new Error('No such email address for user');

    const token: string = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addEmailVerificationToken(dbUser.id, address, token);

    await this.passwordNotificationManager.sendVerify('email',  { address, user: dbUser, token });

    const message: Message = { message: 'Email Sent' }
    
    return message

  }

  public sendResetPasswordEmail = async ({ address }: { address: string }) : Promise <Message> => {

    if(!address) throw new Error('Invalid email');

    const dbUser: User = await this.databaseInterface.findUserByEmail(address);
    
    if (!dbUser) throw new Error('User not found');

    const email = getFirstUserEmail(dbUser, address);

    const token: string = this.tokenManager.generateRandomToken();

    await this.databaseInterface.addResetPasswordToken(dbUser.id, address, token);

    await this.passwordNotificationManager.sendVerify('email',  { address, user: dbUser, token });

    const message: Message = { message: 'Email Sent' }
    
    return message

  }

  public authenticate = async ({ username, email, userId, password } : PasswordLogin, connectionInfo: ConnectionInformations) : Promise <LoginResult> => {

    if(!username && !email && !userId) throw new Error('Username, Email or userId is Required');

    // Fetch the user from database
    const user: User | null = userId ? await this.databaseInterface.findUserById(userId)
      : username ? await this.databaseInterface.findUserByUsername(username)
      : email ? await this.databaseInterface.findUserByEmail(email)
      : null

    if(!user) throw new Error('User Not Found');

    const hash: string = await this.databaseInterface.findPasswordHash(user.id);

    if (!hash) throw new Error('User has no password set');

    const hashedPassword: string = this.hashAlgorithm 
      ? hashPassword(password, this.hashAlgorithm)
      : password

    const isPasswordValid: boolean = await verifyPassword(hashedPassword, hash)

    if (!isPasswordValid) throw new Error('Incorrect password');

    const loginResult: LoginResult = this.accountsServer.loginWithUser(user, connectionInfo);

    return loginResult
  }
}