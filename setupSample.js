// ==============================================
// Database Interface
// ==============================================

const databaseInterface = new MongoInterface({
  url:'',
  port:21027,
  collectionName:'users'
})



// ==============================================
// Token Manager
// ==============================================

const tokenManager = new TokenManager({
  secret:'SuperSecretString',
  accessConfig:{
    algorithm:null,
    expiresIn:null,
    notBefore:null,
    audience:null,
    jwtid:null,
    subject:null,
    noTimestamp:null,
    header:null,
    keyid:null
  },
  refreshConfig:{
    algorithm:null,
    expiresIn:null,
    notBefore:null,
    audience:null,
    jwtid:null,
    subject:null,
    noTimestamp:null,
    header:null,
    keyid:null
  }
})



// ==============================================
// Notification Manager
// ==============================================

// => Email Notification Service
const email = new EmailNotificationService({
  templates:{},
  from:'accounts-js@gmail.com',
})

// >=> Notification Manager
const notificationManager = new NotificationManager({
  services: [email],
})



// ==============================================
// Authentication Manager
// ==============================================


// ================================
// >=> OAuth Authentication Service

// => Facebook Provider
const facebook = new FacebookProvider({
  onSuccess: ()=>null,
  onFail: ()=>null
});

// => Twitter Provider
const twitter = new TwitterProvider({
  onSuccess: ()=>null,
  onFail: ()=>null
})

// ==> Transport
const expressOAuthTransport = new ExpressOauthTransport({

})

// >=> OAuth Authentication Service
const oauth = new OAuthService({
  providers: [facebook, twitter],
  transport: [expressOAuthTransport]
})

// ================================
// >=> Password Authentication Service

const expressPasswordTransport = new ExpressPasswordTransport({
  
})

const password = new PasswordService({
  transport: [expressPasswordTransport],
  notification
})

//  >=> ======================= >=>
//  >=> Authentication Manager  >=>
//  >=> ======================= >=>

const authenticationManager = new AuthenticationManager({
  services: [oauth, password]
})


const expressTokenTransportHeaders = new ExpressTokenTransportHeaders({
  access: {
    name: 'accessToken',
    canStore: (req)=>true
  },
  refresh: {
    name: 'refresh-token',
    canStore: (req)=>true
  }
})

const expressTokenTransportCookies = new ExpressTokenTransportCookies({
  access: {
    name:'accessToken',
    canStore: (req) => true,
    expiresIn: '10m',
    httpOnly: false
  },
  refresh: {
    name:'refreshToken',
    canStore: (req) => true,
    expiresIn: '1d',
    httpOnly: false
  }
})


const expressTransport = new ExpressTransport({
  tokenTransport: new TokenTransportManager({
    tokenTransports: [ExpressTokenTransportHeaders, ExpressTokenTransportCookies]
  })
})

const transport = new TransportManager({
  interfaces: [ExpressTransport]
})


new AccountsServer({
  databaseInterface,
  tokenManager,
  notificationManager,
  authenticationManager
})