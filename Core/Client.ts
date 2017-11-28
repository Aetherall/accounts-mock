


type AccountsClientConfiguration = {
    transport: TransportInterface,

}

class AccountsClient {
    
        private transport: TransportInterface
    
        constructor(options:AccountsClientConfiguration){
            this.transport = options.transport;
    
        }
    
        // ===========================================
        // Logging
    
        login = (loginData:LoginType) => {
            this.transport.login(loginData)
        }
    
        logout = (accessToken) => {
            this.transport.logout()
        }
    
        isLoggingIn = () => {
            
        }
    
        // ============================================
        // Session
    
        resumeSession = (accessToken) => {
    
        }
    
        refreshSession = () => {
    
        }
    
        // ============================================
        // Impersonation
    
        impersonate = () => {
    
        }
    
        stopImpersonation = () => {
    
        }
    
        isImpersonated = () => {
    
        }
        
    
        // ============================================
        // Password Authentification
    
        createUser = () => {
            
        }
    
        requestVerificationEmail = () => {
    
        }
    
        verifyEmail = () => {
    
        }
    
}