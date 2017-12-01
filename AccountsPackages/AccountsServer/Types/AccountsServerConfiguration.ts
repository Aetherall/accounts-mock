import { DatabaseInterface } from '../../Types/DatabaseInterface';
import { AuthenticationService } from "../../Types/AuthenticationService";
import { TokenManagerInterface } from '../../Types/TokenManagerInterface';
import { User } from '../../Types/User';
import { Session } from '../../Types/Session';

export interface AccountsServerConfiguration {

  siteUrl?: string;

  databaseInterface: DatabaseInterface;

  authenticationServices: AuthenticationService[];

  tokenManager: TokenManagerInterface;

  impersonationAuthorize?: ( user: User, impersonateToUser: User ) => Promise<any>;

  resumeSessionValidator?: ( user: User, session: Session ) => Promise<any>;

}