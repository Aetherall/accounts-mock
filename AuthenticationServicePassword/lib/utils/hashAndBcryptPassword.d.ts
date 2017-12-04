import { Password } from "../types/Password";
export declare const getHashAndBcryptPassword: (hashPasswordWithAlgorithm: Function) => (password: Password) => Promise<string>;
