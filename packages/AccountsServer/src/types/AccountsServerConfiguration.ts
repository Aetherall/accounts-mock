import { 
  DatabaseInterface,
  TokenManagerInterface,
  AuthenticationService,
  User,
  Session,
  NotificationService
} from 'accounts';


export type ImpersonationAuthorize = ( user: User, impersonateToUser: User ) => Promise <any>;

export type ResumeSessionValidator = ( user: User, session: Session ) => Promise <any>;

export interface AccountsServerConfiguration {

  siteUrl?: string;

  databaseInterface: DatabaseInterface;

  tokenManager: TokenManagerInterface;

  transport: any;

  authenticationServices: AuthenticationService[];

  notificationServices: NotificationService[];

  impersonationAuthorize?: ImpersonationAuthorize;

  resumeSessionValidator?: ResumeSessionValidator;

}