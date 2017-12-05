import { DatabaseInterface, User, Session, ConnectionInformations } from 'accounts';

import { MongoInterfaceConfiguration } from './types/MongoInterfaceConfiguration';

import { get, merge } from 'lodash';
import { toMongoID } from './utils/toMongoId';


const defaultConfiguration: MongoInterfaceConfiguration = {
  userCollectionName: 'users',
  sessionCollectionName: 'sessions',
  idProvider: undefined,
  dateProvider: undefined,
  caseSensitiveUserName: true,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  useMongoId:{
    user: true,
    session: true
  }
}

export default class MongoInterface implements DatabaseInterface {
  
  private config: MongoInterfaceConfiguration;

  private db: any;

  private userCollection: any;

  private sessionCollection: any;


  constructor( db: any, config?: MongoInterfaceConfiguration ){

    this.config = merge({},defaultConfiguration, config);
    
    this.waitForDatabaseConnection(db)
  }
  

  waitForDatabaseConnection = async ( db: any ) => {
    // await to resolve connection to database
    this.db = await db;

    console.log(this.db.Db);

    this.userCollection = db.collection(this.config.userCollectionName);

    this.sessionCollection = db.collection(this.config.sessionCollectionName);
  }

  mongoId = ( id: string , userOrSession: string ) => this.config.useMongoId[userOrSession] ? toMongoID(id) : id

  provideId = () => this.config.idProvider && { _id: this.config.idProvider() }

  

  createUser = async ({ email, username, password } : { email: string, username: string, password: string }) : Promise <string> => {

    const user = {
      services: {
        ...password && { bcrypt: password },
      },
      ...email && { emails: [{ address: email.toLowerCase(), verified: false }] },
      ...username && { username },
      ...this.provideId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const ret = await this.userCollection.insertOne(user);

    return ret.ops[0]._id;

  }

  public findUserById = async (userId: string) => {

    const id = this.mongoId(userId, 'user');

    const user = await this.userCollection.findOne({ _id: id });

    if (user) user.id = user._id;

    return user;
  }

  public findUserByEmail = async ( email: string ): Promise <User | null> => {

    const filter = { 'emails.address': email.toLowerCase() }

    const user = await this.userCollection.findOne(filter);

    if (user) user.id = user._id;

    return user;
  }

  public findUserByUsername = async ( username: string ): Promise <User | null> => {

    const filter = this.config.caseSensitiveUserName
      ? { username }
      : { $where: `obj.username && (obj.username.toLowerCase() === "${username.toLowerCase()}")` }
    
    const user = await this.userCollection.findOne(filter);

    if (user) user.id = user._id;

    return user;
  }

  public findPasswordHash = async ( userId: string ): Promise <string | null> => {

    const id = this.mongoId(userId, 'user');

    const user = await this.findUserById(id);

    if (user) return get(user, 'services.password.bcrypt')

    return null;
  }

  
  public findUserByEmailVerificationToken = async ( token: string ): Promise <User | null> => {

    const filter = { 'services.email.verificationTokens.token': token }

    const user = await this.userCollection.findOne(filter);

    if (user) user.id = user._id

    return user;
  }

  public findUserByResetPasswordToken = async ( token: string ): Promise <User | null> => {

    const filter = { 'services.email.reset.token': token }

    const user = await this.userCollection.findOne(filter);
    
    if (user) user.id = user._id
    
    return user;
  }

  public findUserByServiceId = async ( serviceName: string, serviceId: string ): Promise <User | null> => {

    const filter = { [`services.${serviceName}.id`]: serviceId }

    const user = await this.userCollection.findOne(filter);
    
    if (user) user.id = user._id
    
    return user;
  }

  public addEmail = async ( userId: string, newEmail: string, verified: boolean ): Promise <void> => {

    const id = this.mongoId(userId, 'user');

    const filter = { _id: id };

    const modifier = {
      $addToSet: {
        emails: { address: newEmail.toLowerCase(), verified },
      },
      $set: { [this.config.timestamps.updatedAt]: Date.now() },
    }

    const ret = await this.userCollection.update(filter, modifier);

    if (ret.result.nModified === 0) throw new Error('User not found');
  }


  public removeEmail = async (userId: string, email: string): Promise <void> => {

    const id = this.mongoId(userId, 'user');
    
    const filter = { _id: id };

    const modifier = {
      $pull: { emails: { address: email.toLowerCase() } },
      $set: { [this.config.timestamps.updatedAt]: Date.now() },
    }

    const ret = await this.userCollection.update(filter, modifier);

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public verifyEmail = async ( userId: string, email: string ): Promise <void> => {

    const id = this.mongoId(userId, 'user');

    const filter = { _id: id, 'emails.address': email };

    const modifier = {
      $set: {
        'emails.$.verified': true,
        [this.config.timestamps.updatedAt]: Date.now(),
      },
      $pull: { 'services.email.verificationTokens': { address: email } },
    }

    const ret = await this.userCollection.update( filter, modifier );

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public setUsername = async (userId: string, newUsername: string): Promise <void> => {

    const id = this.mongoId(userId, 'user');

    const filter = { _id: id };

    const modifier = {
      $set: {
        username: newUsername,
        [this.config.timestamps.updatedAt]: Date.now(),
      }
    }
    
    const ret = await this.userCollection.update( filter, modifier );

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public setPassword = async ( userId: string, newPassword: string ): Promise<void> => {

    const id = this.mongoId(userId, 'user');

    const filter = { _id: id };

    const modifier = {
      $set: {
        'services.password.bcrypt': newPassword,
        [this.config.timestamps.updatedAt]: Date.now(),
      },
      $unset: {
        'services.password.reset': '',
      },
    }

    const ret = await this.userCollection.update( filter, modifier );
    
    if (ret.result.nModified === 0) throw new Error('User not found');
  }



  public setService = async ( userId: string, serviceName: string, service: object ): Promise<object> => {
    
    const id = this.mongoId(userId, 'user');

    const filter = { _id: id };

    const modifier = {
      $set: {
        [`services.${serviceName}`]: service,
        [this.config.timestamps.updatedAt]: Date.now(),
      },
    }

    const ret = await this.userCollection.update( filter, modifier );
    //added =>
    if (ret.result.nModified === 0) throw new Error('User not found');

    return service;
  }

  public createSession = async ( userId: string, connectionInformations: ConnectionInformations, extraData?: object ): Promise<string> => {

    const session = {
      ...this.provideId(),
      userId,
      connectionInformations,
      extraData,
      valid: true,
      [this.config.timestamps.createdAt]: this.config.dateProvider(),
      [this.config.timestamps.updatedAt]: this.config.dateProvider(),
    };

    const ret = await this.sessionCollection.insertOne(session);

    return ret.ops[0]._id;
  }

  public updateSession = async ( sessionId: string, connectionInformations: ConnectionInformations ): Promise<void> => {

    const id = this.mongoId(sessionId, 'session');

    const filter = { _id: id };
    
    const modifier = {
      $set: {
        connectionInformations,
        [this.config.timestamps.updatedAt]: this.config.dateProvider(),
      }
    }

    await this.sessionCollection.update( filter, modifier );
  }

  public invalidateSession = async (sessionId: string): Promise<void> => {

    const id = this.mongoId(sessionId, 'session');

    const filter = { _id: id };
    
    const modifier = {
      $set: {
        valid: false,
        [this.config.timestamps.updatedAt]: this.config.dateProvider(),
      }
    }

    await this.sessionCollection.update( filter, modifier );
  }

  public invalidateAllSessions = async (userId: string): Promise<void> => {

    const id = this.mongoId(userId, 'user');

    const filter = { userId: id };

    const modifier = {
      $set: {
        valid: false,
        [this.config.timestamps.updatedAt]: this.config.dateProvider(),
      }
    }

    await this.sessionCollection.updateMany( filter, modifier );
  }

  public findSessionById = async (sessionId: string): Promise <Session | null> => {

    const id = this.mongoId(sessionId, 'session');

    const filter = { _id: id }

    return this.sessionCollection.findOne(filter);
  }

  public addEmailVerificationToken = async ( userId: string, email: string, token: string ): Promise <void> => {

    const id = this.mongoId(userId, 'user');
    
    const filter = { _id: id };

    const modifier = {
      $push: {
        'services.email.verificationTokens': {
          token,
          address: email.toLowerCase(),
          when: Date.now(),
        },
      },
    }

    await this.userCollection.update(filter, modifier);
  }

  public addResetPasswordToken = async ( userId: string, email: string, token: string, reason: string = 'reset' ): Promise<void> => {
    
    const id = this.mongoId(userId, 'user');

    const filter = { _id: id };
    
    const modifier = {
      $push: {
        'services.password.reset': {
          token,
          address: email.toLowerCase(),
          when: Date.now(),
          reason,
        },
      },
    }

    await this.userCollection.update(filter, modifier);
  }

  public setResetPassword = async ( userId: string, email: string, newPassword: string ): Promise<void> => {

    const id = this.mongoId(userId, 'user');

    return this.setPassword(id, newPassword);
  }


}