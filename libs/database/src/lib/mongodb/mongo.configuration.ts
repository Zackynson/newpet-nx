import { ConnectOptions } from 'mongoose';
import { DatabaseType } from '../enums/database-type.enum';
import { MongoOption } from './interfaces/database-mongo-option';
import { CAF_MONGO_CONNECTION, TRUST_MONGO_CONNECTION } from './mongo.constants';

export interface MongoDefaultOptions {
	caf: MongoOption;
	trust: MongoOption;
	clientOptions: ConnectOptions;
}

export function defaultOptions(): MongoDefaultOptions {
	return {
		caf: {
			type: DatabaseType.MONGODB,
			uri: process.env.CAF_MONGO_CLUSTER_URI as string,
			connectionName: CAF_MONGO_CONNECTION,
			database: 'admindb',
		},
		trust: {
			type: DatabaseType.MONGODB,
			uri: process.env.TRUST_MONGO_CLUSTER_URI as string,
			connectionName: TRUST_MONGO_CONNECTION,
			database: 'admindb',
		},
		clientOptions: {
			socketTimeoutMS: 13000,
			connectTimeoutMS: 10000,
			maxPoolSize: 1,
			serverSelectionTimeoutMS: 3000,
		},
	};
}
