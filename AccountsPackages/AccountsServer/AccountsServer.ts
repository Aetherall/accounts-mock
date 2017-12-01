import { AccountsServerConfiguration } from "./Types/AccountsServerConfiguration";
import { AuthenticationServices, AuthenticationService } from "../Types/AuthenticationService";
import { DatabaseInterface } from "../Types/DatabaseInterface";
import { TokenManagerInterface } from "../Types/TokenManagerInterface";

import { ConnectionInformations } from "../Types/ConnectionInformations";
import { User } from "../Types/User";
import { Session } from "../Types/Session";
import { UserClean } from "../Types/UserClean";
import { Tokens } from "../Types/Tokens";
import { LoginResult } from "../Types/LoginResult";
import { ImpersonationResult } from "../Types/ImpersonationResult";


class AccountsServer {
  
  private databaseInterface: DatabaseInterface;
  
  private authenticationServices: AuthenticationServices;
  
	private tokenManager: TokenManagerInterface;

	private impersonationAuthorize: Function;
	private resumeSessionValidator: Function;
	
	
  constructor( config: AccountsServerConfiguration ){
  
    this.checkconfig(config);
		
		this.impersonationAuthorize = config.impersonationAuthorize;
		this.resumeSessionValidator = config.resumeSessionValidator;

		this.databaseInterface = config.databaseInterface;
		this.tokenManager = config.tokenManager;

		this.authenticationServices = config.authenticationServices.reduce(
      ( a: AuthenticationServices, authenticationService: AuthenticationService ) =>
    	({ ...a, [authenticationService.name]: authenticationService })
		,{})
		
	}
  
	checkconfig = ( config: AccountsServerConfiguration ) : void => {

		if( !config.databaseInterface ) 
			throw new AccountsError('[ Accounts - Server ] Init : A database interface is required');

		if( !config.authenticationServices ) 
			throw new AccountsError('[ Accounts - Server ] Init : At least one Authentication Service is required');
		
	}


	useService = ( target: any, params: any, connectionInfo: ConnectionInformations ) : any => {
		
		const { service, ...serviceParams } = target;

		const authenticationService: AuthenticationService = this.authenticationServices[ service ];

		if(!authenticationService) throw new AccountsError(`[ Accounts - AuthenticationManager ] useService : Service ${service} not found`);

		return authenticationService.useService( serviceParams, params, connectionInfo );
				
	}
  
  
	loginWithUser = async ( dbUser: User, connectionInfo: ConnectionInformations ) : Promise <LoginResult>  => {

		const { ip, userAgent } = connectionInfo;

		const sessionId: string = await this.databaseInterface.createSession(dbUser.id, ip, userAgent);

		const tokens = {
			accessToken: this.tokenManager.generateAccess({ sessionId }),
			refreshToken: this.tokenManager.generateRefresh()
		}

		const user: UserClean = this.sanitizeUser(dbUser);

		const loginResult: LoginResult = { user, sessionId, tokens };

		return loginResult;

	}
  
	impersonate = async ( accessToken: string, username: string, connectionInfo: ConnectionInformations ) : Promise <ImpersonationResult> => {

		if (!isString(accessToken)) 
			throw new AccountsError('[ Accounts - Server ] Impersonate : An accessToken is required');

		await this.tokenManager.decode(accessToken);

		const session: Session = await this.findSessionByAccessToken(accessToken);

		if (!session.valid) 
			throw new AccountsError('Session is not valid for user')

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) 
			throw new AccountsError('User not found')

		const impersonatedUser: User = await this.databaseInterface.findUserByUsername(username);

		if (!impersonatedUser) 
			throw new AccountsError(`User ${username} not found`)

		if (!this.impersonationAuthorize) return { authorized: false }

		const isAuthorized: boolean = await this.impersonationAuthorize( dbUser, impersonatedUser );

		if (!isAuthorized) return { authorized: false }

		const newSessionId: string = await this.databaseInterface.createSession( impersonatedUser.id, connectionInfo, { impersonatorUserId: dbUser.id });

		const impersonationTokens: Tokens = this.createTokens(newSessionId, true);

		const user: UserClean = this.sanitizeUser(impersonatedUser);

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

		if (!isString(accessToken) || !isString(refreshToken)) 
				throw new AccountsError('[ Accounts - Server ] RefreshTokens : An accessToken and refreshToken are required')
		
		await this.tokenManager.decode(refreshToken);

		const sessionId: string = await this.tokenManager.decode(accessToken);

		const session: Session = await this.databaseInterface.findSessionById(sessionId);

		if(!session) 
				throw new AccountsError('Session not found');

		if(!session.valid) 
				throw new AccountsError('Session is no longer valid', { id: session.userId })

		const user: User = await this.databaseInterface.findUserById(session.userId);

		if(!user) 
				throw new AccountsError('User not found', { id: session.userId });

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

		if(!session.valid) throw new AccountsError('Session is no longer valid', { id: session.userId });

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) throw new AccountsError('User not found', { id: session.userId });

		await this.databaseInterface.invalidateSession(session.sessionId);

	}
  
  
	resumeSession = async ( accessToken: string ) : Promise <UserClean> => {

		const session: Session = await this.findSessionByAccessToken(accessToken);

		if(!session.valid) throw new AccountsError('Session is no longer valid', { id: session.userId });

		const dbUser: User = await this.databaseInterface.findUserById(session.userId);

		if (!dbUser) throw new AccountsError('User not found', { id: session.userId });

		if (this.options.resumeSessionValidator) await this.options.resumeSessionValidator(dbUser, session);

		const user: UserClean = this.sanitizeUser(dbUser);

		return user;
	}
  
  
	findSessionByAccessToken = async ( accessToken: string ) : Promise <Session> =>  {

		if (!isString(accessToken)) throw new AccountsError('An accessToken is required');

		const decodedAccessToken: any = await this.tokenManager.decode(accessToken);

		const sessionId: string = decodedAccessToken.data.sessionId;

		const session: Session = await this.databaseInterface.findSessionById(sessionId);

		if(!session) throw new AccountsError('Session not found');

		return session;

	}
  
      
  
}