export interface LoginResult {
  
  sessionId: string;

  user: UserSafe;

  tokens: Tokens;
}