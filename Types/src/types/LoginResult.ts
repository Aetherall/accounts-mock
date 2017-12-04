import { UserSafe } from "./UserSafe";
import { Tokens } from "./Tokens";

export interface LoginResult {
  
  sessionId: string;

  user: UserSafe;

  tokens: Tokens;
}