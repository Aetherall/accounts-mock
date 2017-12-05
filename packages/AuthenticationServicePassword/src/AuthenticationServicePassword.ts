import AccountsServer from '@accounts/server';

import { 
  AuthenticationService, 
  DatabaseInterface,
  ConnectionInformations,
  User,
  TokenRecord,
  EmailRecord,
  LoginResult,
  RegistrationResult,
  Message,
  TokenManagerInterface
} from 'accounts';

import { UserPasswordRegistration } from './types/UserPasswordRegistration';
import { HashAlgorithm } from './types/HashAlgorithm';
import { PasswordServiceConfiguration } from './types/PasswordServiceConfiguration';
import { UserPasswordLogin } from './types/UserPasswordLogin';
import { Password } from './types/Password';

import { merge, get } from 'lodash';

import { getFirstUserEmail } from './utils/getFirstUserEmail';
import { getHashPassword } from './utils/hashPassword';
import { getHashAndBcryptPassword } from './utils/hashAndBcryptPassword';
import { verifyPassword } from './utils/verifyPassword';


const defaultConfiguration: PasswordServiceConfiguration = {
  
  validation: {
    username: () => true,
    email: () => true,
    password: () => true
  },

  passwordHashAlgorithm: 'sha256',
  
}


export default class AuthenticationServicePassword implements AuthenticationService {

  public name: string = 'password';

  private config: PasswordServiceConfiguration;

  public accountsServer: AccountsServer;

  public databaseInterface: DatabaseInterface;

  public tokenManager: TokenManagerInterface;


  private hashPassword: ( password: Password ) => string;

  private hashAndBcryptPassword: ( password: Password ) => Promise <string>;


  constructor( config?: PasswordServiceConfiguration ){

    this.config = merge({}, defaultConfiguration, config);

    this.hashPassword = getHashPassword(this.config.passwordHashAlgorithm)

    this.hashAndBcryptPassword = getHashAndBcryptPassword(this.hashPassword);

  }

  link = ( accountsServer: AccountsServer ) : this => {
    
    this.accountsServer = accountsServer;
    
    this.databaseInterface = this.accountsServer.databaseInterface;

    this.tokenManager = this.accountsServer.tokenManager;
        
    return this;
    
  }



  public useService = ( target: any, params: any, connectionInfo: ConnectionInformations ) : Promise <object> => {

    const actionName: string = target.action;

    const action: Function = this[actionName];

    if(!action) throw new Error(`[ Accounts - Password ] useService : No action matches ${actionName} `)
    
    return action( params, connectionInfo )

  }



  public register = async ( params: UserPasswordRegistration ) : Promise <RegistrationResult> => {

    const { username, email, password } = params;

    if( !username && !email ) throw new Error('Username or Email is required');

    if( username && !this.config.validation.username(username) ) throw new Error(' Username does not pass validation ')

    if( email && !this.config.validation.email(email) ) throw new Error(' Email does not pass validation ')

    if( password && !this.config.validation.password(password) ) throw new Error(' Password does not pass validation ')

    if (username && (await this.databaseInterface.findUserByUsername(username))) throw new Error('Username already exists');

    if (email && (await this.databaseInterface.findUserByEmail(email))) throw new Error('Email already exists');

    const newUser: UserPasswordRegistration = {
      ...username && { username },
      ...email && { email },
      ...password && { password: await this.hashAndBcryptPassword(password) }
    }

    const userId: string = await this.databaseInterface.createUser(newUser);

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

    if (this.accountsServer.tokenManager.isTokenExpired(token, resetTokenRecord)) {
      throw new Error('Reset password link expired');
    }

    const emails: EmailRecord[] = dbUser.emails || [];

    if(!emails.find( e => e.address === resetTokenRecord.address )) throw new Error('Token has invalid email address')
    
    const password: string = await this.hashAndBcryptPassword(newPassword);

    // Change the user password and remove the old token
    await this.databaseInterface.setResetPassword(dbUser.id, resetTokenRecord.address, password);

    // Changing the password should invalidate existing sessions
    await this.databaseInterface.invalidateAllSessions(dbUser.id);

    const message: Message = { message:'Password Changed' }

    return message

  }



  public sendVerificationEmail = async ({ address }: { address: string }) : Promise <Message> => {

    if(!address) throw new Error('Invalid email');

    const dbUser: User = await this.databaseInterface.findUserByEmail(address);

    if (!dbUser) throw new Error('User not found');

    const emails: EmailRecord[] = dbUser.emails || [];

    if (!emails.find( ( e: EmailRecord ) => e.address === address )) throw new Error('No such email address for user');

    const token: string = this.tokenManager.generateRandom();

    await this.databaseInterface.addEmailVerificationToken(dbUser.id, address, token);

    await this.accountsServer.useNotificationService('email').notify( 'password', 'verification', { address, user: dbUser, token })

    const message: Message = { message: 'Email Sent' }
    
    return message

  }



  public sendResetPasswordEmail = async ({ address }: { address: string }) : Promise <Message> => {

    if(!address) throw new Error('Invalid email');

    const dbUser: User = await this.databaseInterface.findUserByEmail(address);
    
    if (!dbUser) throw new Error('User not found');

    const email = getFirstUserEmail(dbUser, address);

    const token: string = this.tokenManager.generateRandom();

    await this.databaseInterface.addResetPasswordToken(dbUser.id, address, token);

    await this.accountsServer.useNotificationService('email').notify( 'password', 'resetPassword', { address, user: dbUser, token })

    const message: Message = { message: 'Email Sent' }
    
    return message

  }



  public authenticate = async ({ username, email, userId, password } : UserPasswordLogin, connectionInfo: ConnectionInformations) : Promise <LoginResult> => {

    if(!username && !email && !userId) throw new Error('Username, Email or userId is Required');

    // Fetch the user from database
    const user: User | null = userId ? await this.databaseInterface.findUserById(userId)
      : username ? await this.databaseInterface.findUserByUsername(username)
      : email ? await this.databaseInterface.findUserByEmail(email)
      : null

    if(!user) throw new Error('User Not Found');

    const hash: string = await this.databaseInterface.findPasswordHash(user.id);

    if (!hash) throw new Error('User has no password set');

    const hashedPassword: string = this.hashPassword( password )

    const isPasswordValid: boolean = await verifyPassword(hashedPassword, hash)

    if (!isPasswordValid) throw new Error('Incorrect password');

    const loginResult: LoginResult = await this.accountsServer.loginWithUser(user, connectionInfo);

    return loginResult
  }
}