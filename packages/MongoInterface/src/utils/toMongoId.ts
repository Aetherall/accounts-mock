import { ObjectID } from 'mongodb';

export const toMongoID = ( objectId ) => {
  if (typeof objectId === 'string') {
    return new ObjectID(objectId);
  }
  return objectId;
};