import { HashAlgorithm } from "../types/HashAlgorithm";
import { Password } from "../types/PasswordType";
;
import { bcryptPassword } from "./bcryptPassword";


export const getHashAndBcryptPassword = ( hashPasswordWithAlgorithm: Function ) => ( password: PasswordType ) : Promise <string> => {

    const hashedPassword: string = hashPasswordWithAlgorithm( password );

    return bcryptPassword( hashedPassword )

}