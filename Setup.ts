import Mongo from 'mongodb'
import AccountsServer, { 
  MongoInterface, 
  PasswordService, 
  OAuthFacebook, 
  OAuthService, 
  TokenTransportExpressBody, 
  TransportExpress, 
  NotificationPluginEmailPassword, 
  NotificationServiceMailgun, 
  NotificationServiceDebug, 
  TokenManager } from './index';


const db = new Mongo('');

const databaseInterface = new MongoInterface(db,{})

const passwordService = new PasswordService({

  validation:{

    username: (username) => true,

    password: (password) => true

  }
  
})

const facebookProvider = new OAuthFacebook()

//const twitterProvider = new TwitterProvider()

const oauthService = new OAuthService({

  authenticationProviders: [ facebookProvider ]

})

const tokenTransport = new TokenTransportExpressBody(
  {
    access:{
      name: 'accessToken',
      canStore: () => true
    },
    refresh:{
      name: 'refreshToken',
      canStore: () => true
    }
  }
)

const transport = new TransportExpress({
  tokenTransport: tokenTransport
})


const passwordEmails = new NotificationPluginEmailPassword({})



const emailService = new NotificationServiceMailgun({

  notificationPlugins: [ passwordEmails ]

});


const tokenManager = new TokenManager({ secret: 'eeeeeee' })


const accountsServer = new AccountsServer({
  databaseInterface,
  tokenManager,
  authenticationServices: [ passwordService, oauthService ],
  transport,
  notificationServices: [ emailService ]
})