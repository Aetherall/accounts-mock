import { User } from "./User";
import { Session } from "./Session";

export interface DatabaseInterface {

  createUser({ email, username, password } : { email: string, username: string, password: string }) : Promise <string>;

  findUserById( userId: string ) : Promise <User>;

  findUserByUsername( username: string ) : Promise <User>;
  
  findUserByEmailVerificationToken( token: string ) : Promise <User>;
  
  findUserByResetPasswordToken( token: string ) : Promise <User>;
  
  findUserByServiceId( serviceName: string, serviceId: string ) : Promise <User>;
  
  findPasswordHash( userId: string ) : Promise <string>;

  addEmail( userId: string, newEmail: string, verified: boolean ): Promise <void>;

  removeEmail(userId: string, email: string): Promise <void>

  verifyEmail( userId: string, email: string ): Promise <void>

  setUsername(userId: string, newUsername: string): Promise <void>

  setPassword( userId: string, newPassword: string ): Promise <void>

  setService( userId: string, serviceName: string, service: object ): Promise <object>

  createSession( userId: string, ip?: string, userAgent?: string, extraData?: object ): Promise <string>

  updateSession( sessionId: string, ip: string, userAgent: string ): Promise <void>

  invalidateSession(sessionId: string): Promise <void>

  invalidateAllSessions(userId: string): Promise <void>

  findSessionById(sessionId: string): Promise <Session>

  addEmailVerificationToken( userId: string, email: string, token: string ): Promise <void>

  addResetPasswordToken( userId: string, email: string, token: string, reason: string ): Promise <void>

  setResetPassword( userId: string, email: string, newPassword: string ): Promise <void>
}