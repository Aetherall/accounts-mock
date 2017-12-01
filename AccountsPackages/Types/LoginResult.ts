export interface LoginResult {
  
  sessionId: string;

  user: UserClean;

  tokens: Tokens;
}