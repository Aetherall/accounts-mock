import { AccountsServerConfiguration, ImpersonationAuthorize, ResumeSessionValidator } from "../types/AccountsServerConfiguration";

import { AuthenticationServices, AuthenticationService } from "../../Types/AuthenticationService";

import { TokenManagerInterface } from "../../TokenManager/types/TokenManagerInterface";
import { DatabaseInterface } from "../../Types/DatabaseInterface";

import { ConnectionInformations } from "../../Types/ConnectionInformations";
import { User } from "../../Types/User";
import { Session } from "../../Types/Session";
import { UserSafe } from "../../Types/UserSafe";
import { Tokens } from "../../Types/Tokens";
import { LoginResult } from "../../Types/LoginResult";
import { ImpersonationResult } from "../../Types/ImpersonationResult";
import { NotificationServices, NotificationService } from "../../Types/NotificationService";

import { omit } from 'lodash';
import { TokenPayload } from "../../Types/TokenPayload";


export default class AccountsServer {
  
  public databaseInterface: DatabaseInterface;
  
	public tokenManager: TokenManagerInterface;

	public transport: any;

	private authenticationServices: AuthenticationServices;
	
	private notificationServices: NotificationServices;
  

	private impersonationAuthorize?: ImpersonationAuthorize;

	private resumeSessionValidator?: ResumeSessionValidator;
	
	
  constructor( config: AccountsServerConfiguration ){
  
    this.checkconfig(config);
		
		this.impersonationAuthorize = config.impersonationAuthorize;
		this.resumeSessionValidator = config.resumeSessionValidator;

		this.databaseInterface = config.databaseInterface;
		this.tokenManager = config.tokenManager;

		this.transport = config.transport.link(this)

		this.authenticationServices = config.authenticationServices.reduce(
      ( a: AuthenticationServices, authenticationService: AuthenticationService ) =>
    	({ ...a, [authenticationService.name]: authenticationService })
		,{})

		this.notificationServices = config.notificationServices.reduce(
      ( a: NotificationServices, notificationService: NotificationService ) =>
    	({ ...a, [notificationService.name]: notificationService })
		,{})
		
	}
  
	checkconfig = ( config: AccountsServerConfiguration ) : void => {

		if( !config.databaseInterface ) 
			throw new Error('[ Accounts - Server ] Init : A database interface is required');

		if( !config.authenticationServices ) 
			throw new Error('[ Accounts - Server ] Init : At least one Authentication Service is required');
		
	}

	useNotificationService = ( notificationServiceName: string ) => {

		const notificationService: NotificationService = this.notificationServices[notificationServiceName]

		if( !notificationService ) 
			throw new Error(`[ Accounts - Server ] useNotificationService : notificationService ${notificationServiceName} not found`);

		return notificationService
	}


	useService = ( target: any, params: any, connectionInfo: ConnectionInformations ) : any => {
		
		const { service, ...serviceParams } = target;

		const authenticationService: AuthenticationService = this.authenticationServices[ service ];

		if(!authenticationService) 
			throw new Error(`[ Accounts - AuthenticationManager ] useService : Service ${service} not found`);

		return authenticationService.useService( serviceParams, params, connectionInfo );
				
	}
  
  
	loginWithUser = async ( dbUser: User, connectionInfo: ConnectionInformations ) : Promise <LoginResult>  => {

		const sessionId: string = await this.databaseInterface.createSession(dbUser.id, connectionInfo);

		const tokens = {
			accessToken: this.tokenManager.generateAccess({ sessionId }),
			refreshToken: this.tokenManager.generateRefresh()
		}

		const user: UserSafe = this.sanitizeUser(dbUser);

		const loginResult: LoginResult = { user, sessionId, tokens };

		return loginResult;

	}
  
	impersonate = async ( accessToken: string, username: string, connectionInfo: ConnectionInformations ) : Promise <ImpersonationResult> => {

		if (typeof accessToken !== 'string' ) 
			throw new Error('[ Accounts - Server ] Impersonate : An accessToken is required');

		await this.tokenManager.decode(accessToken);

		const session: Session = await this.findSessionByAccessToken(accessToken);

		if (!session.valid) 
			throw new Error('Session is not valid for user')

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) 
			throw new Error('User not found')

		const impersonatedUser: User = await this.databaseInterface.findUserByUsername(username);

		if (!impersonatedUser) 
			throw new Error(`User ${username} not found`)

		if (!this.impersonationAuthorize) return { authorized: false }

		const isAuthorized: boolean = await this.impersonationAuthorize( dbUser, impersonatedUser );

		if (!isAuthorized) return { authorized: false }

		const newSessionId: string = await this.databaseInterface.createSession( impersonatedUser.id, connectionInfo, { impersonatorUserId: dbUser.id });

		const impersonationTokens: Tokens = this.createTokens(newSessionId, true);

		const user: UserSafe = this.sanitizeUser(impersonatedUser);

		const impersonationResult: ImpersonationResult = {
				authorized: true,
				tokens: impersonationTokens,
				user,
		};

		return impersonationResult;

	}
      
	createTokens = ( sessionId: string, isImpersonated?: boolean ) : Tokens => {

		const accessToken: string = this.tokenManager.generateAccess({ sessionId, isImpersonated });

		const refreshToken: string = this.tokenManager.generateRefresh({ sessionId, isImpersonated });

		const tokens: Tokens = { accessToken, refreshToken }

		return tokens

	}
  
	refreshTokens = async ( tokens: Tokens, connectionInfo: ConnectionInformations ) : Promise <LoginResult> => {

		const { accessToken, refreshToken } = tokens;

		if (!( typeof accessToken === "string" && typeof refreshToken === "string" ))
				throw new Error('[ Accounts - Server ] RefreshTokens : An accessToken and refreshToken are required')
		
		await this.tokenManager.decode(refreshToken);

		const { sessionId } : TokenPayload = await this.tokenManager.decode(accessToken);

		const session: Session = await this.databaseInterface.findSessionById(sessionId);

		if(!session) 
				throw new Error('Session not found');

		if(!session.valid) 
				throw new Error('Session is no longer valid')

		const user: User = await this.databaseInterface.findUserById(session.userId);

		if(!user) 
				throw new Error('User not found');

		const newTokens: Tokens = this.createTokens(sessionId);

		await this.databaseInterface.updateSession(sessionId, connectionInfo);

		const loginResult: LoginResult = {
				sessionId, 
				user: this.sanitizeUser(user),
				tokens: newTokens
		}

		return loginResult

	}
  
  
	logout = async ( accessToken: string ) : Promise <void> => {

		const session: Session = await this.findSessionByAccessToken(accessToken);

		if(!session.valid) 
			throw new Error('Session is no longer valid');

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) 
			throw new Error('User not found');

		await this.databaseInterface.invalidateSession(session.sessionId);

	}
  
  
	resumeSession = async ( accessToken: string ) : Promise <UserSafe> => {

		const session: Session = await this.findSessionByAccessToken(accessToken);

		if(!session.valid) 
			throw new Error('Session is no longer valid');

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) 
			throw new Error('User not found');

		if (this.resumeSessionValidator) await this.resumeSessionValidator(dbUser, session);

		const user: UserSafe = this.sanitizeUser(dbUser);

		return user;
	}
  
  
	findSessionByAccessToken = async ( accessToken: string ) : Promise <Session> =>  {

		if (typeof accessToken !== 'string' ) 
			throw new Error('An accessToken is required');

		const decodedAccessToken: any = await this.tokenManager.decode(accessToken);

		const sessionId: string = decodedAccessToken.data.sessionId;

		const session: Session = await this.databaseInterface.findSessionById(sessionId);

		if(!session) 
			throw new Error('Session not found');

		return session;

	}

	sanitizeUser = ( user: User ) : UserSafe => {
		const { services, ...usersafe } = user;
		return usersafe
	}
  
      
  
}