export interface Session {
  sessionId: string;
  userId: string;
  valid: boolean;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}
