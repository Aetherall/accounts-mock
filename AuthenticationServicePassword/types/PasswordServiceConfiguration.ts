import { HashAlgorithm } from "./HashAlgorithm";

export interface PasswordServiceConfiguration {
  
    validation ?: {

      username?: ( username: string ) => boolean | Promise <boolean>;

      email?: ( username: string ) => boolean | Promise <boolean>;

      password?: ( password: string ) => boolean | Promise <boolean>;

    }

    passwordHashAlgorithm: HashAlgorithm;
  
}