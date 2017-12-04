import { ConnectionInformations } from "./ConnectionInformations";
export interface AuthenticationService {
    name: string;
    useService(target: any, params: any, connectionInfos: ConnectionInformations): any;
}
export interface AuthenticationServices {
    [serviceName: string]: AuthenticationService;
}
