

interface AuthenticationServices {
  [ serviceName: string ]: AuthenticationService
}

class AuthenticationManager {

  private accountsServer: AccountsServer;

  private authenticationServices: AuthenticationServices;


  constructor( authenticationServices: AuthenticationService[] ){

    this.authenticationServices = authenticationServices.reduce(
      ( a: AuthenticationServices, authenticationService: AuthenticationService ) =>
      ({ ...a, [authenticationService.name]: authenticationService })
    ,{})

  }

  useService = ( target: any, params: any, connectionInfo: ConnectionInformations ) : any => {

    const { service, ...serviceParams } = target;

    const authenticationService: AuthenticationService = this.authenticationServices[ service ];

    if(!authenticationService) throw new AccountsError(`[ Accounts - AuthenticationManager ] useService : Service ${service} not found`);

    return authenticationService.useService( serviceParams, params, connectionInfo );
    
  }

}