

class TokenTransportManager {
  private tokenTransportStorages;

  constructor(config){
    this.registerTokenTransportStorages(config.tokenTransportStorages);

  }

  registerTokenTransportStorages = (tokenTransportStorages) => tokenTransportStorages.forEach(element => this.tokenTransportStorages[element.name] = element );

  setTokens = () => {

  }
  
  getTokens = () => {

  }
}