import { ObjectID } from 'mongodb';
import { get } from 'lodash';

const toMongoID = objectId => {
  if (typeof objectId === 'string') {
    return new ObjectID(objectId);
  }
  return objectId;
};

export interface MongoOptionsType {
  // The users collection name, default 'users'.
  collectionName?: string;
  // The sessions collection name, default 'sessions'.
  sessionCollectionName?: string;
  // The timestamps for the users and sessions collection, default 'createdAt' and 'updatedAt'.
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  // Should the user collection use _id as string or ObjectId, default 'true'.
  useMongoId?: {
    user?: boolean;
    session?: boolean;
  };
  // Should the session collection use _id as string or ObjectId, default 'true'.
  convertSessionIdToMongoObjectId?: boolean;
  // Perform case intensitive query for user name, default 'true'.
  caseSensitiveUserName?: boolean;
  // Function that generate the id for new objects.
  idProvider?: () => string | object;
  // Function that generate the date for the timestamps.
  dateProvider?: (date?: Date) => any;
}

class MongoInterface {

  constructor(config){
    
  }

  mongoId = (id, userOrSession) => this.useMongoId[userOrSession]
    ? toMongoID(id)
    : id



  createUser = async ({ email, username, password }) => {

    const user = {
      services: {
        ...password && { bcrypt: password },
      },
      ...email && { emails: [{ address: email.toLowerCase(), verified: false }] },
      ...username && { username },
      ...this.idProvider && { _id: this.idProvider() },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const ret = await this.collection.insertOne(user);

    return ret.ops[0]._id;

  }

  public findUserById = async (userId: string) => {

    const id = this.mongoId(userId);

    const user = await this.collection.findOne({ _id: id });

    if (user) user.id = user._id;

    return user;
  }

  public findUserByUsername = async ( username: string ): Promise <UserObjectType | null> => {

    const filter = this.caseSensitiveUserName
      ? { username }
      : { $where: `obj.username && (obj.username.toLowerCase() === "${username.toLowerCase()}")` }
    
    const user = await this.collection.findOne(filter);

    if (user) user.id = user._id;

    return user;
  }

  public findPasswordHash = async ( userId: string ): Promise <string | null> => {

    const id = this.mongoId(userId);

    const user = await this.findUserById(id);

    if (user) return get(user, 'services.password.bcrypt')

    return null;
  }

  
  public findUserByEmailVerificationToken = async ( token: string ): Promise <UserObjectType | null> => {

    const filter = { 'services.email.verificationTokens.token': token }

    const user = await this.collection.findOne(filter);

    if (user) user.id = user._id

    return user;
  }

  public findUserByResetPasswordToken = async ( token: string ): Promise <UserObjectType | null> => {

    const filter = { 'services.email.reset.token': token }

    const user = await this.collection.findOne(filter);
    
    if (user) user.id = user._id
    
    return user;
  }

  public findUserByServiceId = async ( serviceName: string, serviceId: string ): Promise <UserObjectType | null> => {

    const filter = { [`services.${serviceName}.id`]: serviceId }

    const user = await this.collection.findOne(filter);
    
    if (user) user.id = user._id
    
    return user;
  }

  public addEmail = async ( userId: string, newEmail: string, verified: boolean ): Promise <void> => {

    const id = this.mongoId(userId);

    const filter = { _id: id };

    const modifier = {
      $addToSet: {
        emails: { address: newEmail.toLowerCase(), verified },
      },
      $set: { [this.timestamps.updatedAt]: Date.now() },
    }

    const ret = await this.collection.update(filter, modifier);

    if (ret.result.nModified === 0) throw new Error('User not found');
  }


  public removeEmail = async (userId: string, email: string): Promise <void> => {

    const id = this.mongoId(userId);
    
    const filter = { _id: id };

    const modifier = {
      $pull: { emails: { address: email.toLowerCase() } },
      $set: { [this.timestamps.updatedAt]: Date.now() },
    }

    const ret = await this.collection.update(filter, modifier);

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public verifyEmail = async ( userId: string, email: string ): Promise <void> => {

    const id = this.mongoId(userId);

    const filter = { _id: id, 'emails.address': email };

    const modifier = {
      $set: {
        'emails.$.verified': true,
        [this.options.timestamps.updatedAt]: Date.now(),
      },
      $pull: { 'services.email.verificationTokens': { address: email } },
    }

    const ret = await this.collection.update( filter, modifier );

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public setUsername = async (userId: string, newUsername: string): Promise <void> => {

    const id = this.mongoId(userId);

    const filter = { _id: id };

    const modifier = {
      $set: {
        username: newUsername,
        [this.options.timestamps.updatedAt]: Date.now(),
      }
    }
    
    const ret = await this.collection.update( filter, modifier );

    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public setPassword = async ( userId: string, newPassword: string ): Promise<void> => {

    const id = this.mongoId(userId);

    const filter = { _id: id };

    const modifier = {
      $set: {
        'services.password.bcrypt': newPassword,
        [this.options.timestamps.updatedAt]: Date.now(),
      },
      $unset: {
        'services.password.reset': '',
      },
    }

    const ret = await this.collection.update( filter, modifier );
    
    if (ret.result.nModified === 0) throw new Error('User not found');
  }

  public setService = async ( userId: string, serviceName: string, service: object ): Promise<object> => {
    
    const id = this.mongoId(userId);

    

    await this.collection.update(
      { _id: id },
      {
        $set: {
          [`services.${serviceName}`]: service,
          [this.options.timestamps.updatedAt]: Date.now(),
        },
      }
    );
    return service;
  }



}