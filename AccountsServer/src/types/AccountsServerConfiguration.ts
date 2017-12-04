import { 
  DatabaseInterface, 
  AuthenticationService,
  User,
  Session,
  NotificationService
} from '@types/accounts';

import TokenManager from '@accounts/token';


export type ImpersonationAuthorize = ( user: User, impersonateToUser: User ) => Promise <any>;

export type ResumeSessionValidator = ( user: User, session: Session ) => Promise <any>;

export interface AccountsServerConfiguration {

  siteUrl?: string;

  databaseInterface: DatabaseInterface;

  tokenManager: TokenManager;

  transport: any;

  authenticationServices: AuthenticationService[];

  notificationServices: NotificationService[];

  impersonationAuthorize?: ImpersonationAuthorize;

  resumeSessionValidator?: ResumeSessionValidator;

}