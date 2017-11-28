

const toMongoID = objectId => {
  if (typeof objectId === 'string') {
    return new ObjectID(objectId);
  }
  return objectId;
};

class MongoInterface {

  constructor(){

  }

  createUser = async (options) => {
    const user = {
      services: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (options.password) user.services.password = { bcrypt: options.password }

    if (options.username) user.username = options.username

    if (options.email) user.emails = [{ address: options.email.toLowerCase(), verified: false }]

    if (options.idProvider) user._id = options.idProvider()

    const ret = await this.collection.insertOne(user);
    return ret.ops[0]._id;

  }

  public findUserById = (userId: string) => {
    const id = this.options.convertUserIdToMongoObjectId
      ? toMongoID(userId)
      : userId;
    const user = await this.collection.findOne({ _id: id });
    if (user) {
      user.id = user._id;
    }
    return user;
  }

  


}