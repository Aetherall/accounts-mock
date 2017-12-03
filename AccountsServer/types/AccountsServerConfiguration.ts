import { DatabaseInterface } from '../../Types/DatabaseInterface';
import { AuthenticationService } from "../../Types/AuthenticationService";
import { User } from '../../Types/User';
import { Session } from '../../Types/Session';
import TokenManager from '../../TokenManager/src/TokenManager';
import { NotificationService } from '../../Types/NotificationService';

export type ImpersonationAuthorize = ( user: User, impersonateToUser: User ) => Promise <any>;

export type ResumeSessionValidator = ( user: User, session: Session ) => Promise <any>;

export interface AccountsServerConfiguration {

  siteUrl?: string;

  databaseInterface: DatabaseInterface;

  authenticationServices: AuthenticationService[];

  notificationServices: NotificationService[];

  tokenManager: TokenManager;

  impersonationAuthorize?: ImpersonationAuthorize;

  resumeSessionValidator?: ResumeSessionValidator;

}