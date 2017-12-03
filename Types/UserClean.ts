import { EmailRecord } from "./EmailRecord";

export interface UserClean {

  username?: string;

  emails?: EmailRecord[];

  id: string;
  
}