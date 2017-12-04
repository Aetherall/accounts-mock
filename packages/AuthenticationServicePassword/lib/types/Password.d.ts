import { HashAlgorithm } from "./HashAlgorithm";
export declare type Password = string | {
    digest: string;
    algorithm: HashAlgorithm;
};
