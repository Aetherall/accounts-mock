import { Tokens } from "./Tokens";
import { UserClean } from "./UserClean";

export interface ImpersonationResult {
  
  authorized: boolean;

  tokens: Tokens;

  user: UserClean;

}