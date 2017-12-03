import NotificationPluginEmailPassword from './NotificationPluginEmailPassword/src/NotificationPluginEmailPassword';
import NotificationServiceMailgun from './NotificationServiceMailgun/src/NotificationServiceMailgun';
import Mongo from 'mongodb'

import AccountsServer from "./AccountsServer/src/AccountsServer";
import MongoInterface from './MongoInterface/src/MongoInterface';
import AuthenticationServicePassword from './AuthenticationServicePassword/src/AuthenticationServicePassword';
import TokenManager from './TokenManager/src/TokenManager';
import AuthenticationServiceOAuth from './AuthenticationServiceOAuth/src/AuthenticationServiceOAuth';


const db = new Mongo('');

const databaseInterface = new MongoInterface(db,{})

const passwordService = new AuthenticationServicePassword({

  validation:{

    username: (username) => true,

    password: (password) => true

  }
  
})

const facebookProvider = new FacebookProvider()

const twitterProvider = new TwitterProvider()

const oauthService = new OAuthService(facebookProvider, twitterProvider)




const passwordEmails = new NotificationPluginEmailPassword({})



const emailService = new NotificationServiceMailgun({

  notificationPlugins: [ passwordEmails ]

});


const tokenManager = new TokenManager({ secret: 'eeeeeee' })


const accountsServer = new AccountsServer({
  databaseInterface,
  tokenManager,
  authenticationServices: [ passwordService, oauthService ],
  notificationServices: [ emailService ]
})