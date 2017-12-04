
export interface TimeStamps {

  createdAt: string;

  updatedAt: string;

}

export interface useMongoId {

  user: boolean;

  session: boolean;

}


export interface MongoInterfaceConfiguration {

  userCollectionName?: string;

  sessionCollectionName?: string;

  idProvider?: () => string | object;

  dateProvider?: (date?: Date) => any;

  caseSensitiveUserName?: boolean;

  timestamps?: TimeStamps;

  useMongoId?: useMongoId;
  
}