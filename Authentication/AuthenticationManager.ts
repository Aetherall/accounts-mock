

class AuthenticationManager {
  private accountsServer;
  private services;

  constructor(config){
    this.registerServices(config.services);
  }

  registerServices = (services) => services.forEach(element => this.services[element.name] = element)

  authenticate = (service, params, connectionInfo) => {
    
    const authService = this.services[service];
    
    if(!authService) throw new AccountsError(`[ Accounts - AuthenticationManager ] Authenticate : Service ${authService.name} not found`);

    const user = authService.authenticate(params);
    if(!user) throw new AccountsError(`[ Accounts - AuthenticationManager ] Authenticate : Service ${authService.name} was not able to authenticate user`);

    const login = this.accountsServer.loginWithUser(user, connectionInfo);

    return login;
  }

}