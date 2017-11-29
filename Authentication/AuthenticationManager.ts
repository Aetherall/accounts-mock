

class AuthenticationManager {
  private accountsServer;
  private authenticationServices;

  constructor(authenticationServices){
    this.authenticationServices = authenticationServices.reduce(
      (a, authenticationService) => a[authenticationService.name] = authenticationService
    ,{})
  }

  useService = ( target, params, connectionInfo ) => {

    const { service, ...serviceParams } = target;

    const authenticationService = this.authenticationServices[ service ];

    if(!authenticationService) throw new AccountsError(`[ Accounts - AuthenticationManager ] useService : Service ${service} not found`);

    return authenticationService.useService(serviceParams, params, connectionInfo );
    
  }

}