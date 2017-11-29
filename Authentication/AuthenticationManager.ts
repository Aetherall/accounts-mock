

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

    const serviceAction = authenticationService[ first ];

    if(!serviceAction) throw new AccountsError(`[ Accounts - AuthenticationManager ] useService : Service ${service} has no action named ${action}`);

    return serviceAction( params, connectionInfo );
  }

}