import { MongoClientOptions } from 'mongodb';
import { XOR } from 'ts-essentials';

import { DatabaseOptions } from '../../interfaces/database-options.interface';

/**
 * Interface to define a new custom connection
 */
export interface MongoOption extends DatabaseOptions {
	/** Database URI */
	uri: string;
	/** Database name we will initially be connected to and expose via DI. */
	database: string;
	/** A unique name for the connection. If not specified, a default name will be used. */
	connectionName?: string;
	/** Options for the MongoClient that will be created. */
	clientOptions?: MongoClientOptions;
}

/**
 * Interface that allows to pass the intent of using the default
 * configurations of CAF or TRUST databases.
 */
export interface MongoDefaultDatabasesOption extends DatabaseOptions {
	useCAF?: boolean;
	useTRUST?: boolean;
}

// XOR will allow only one of the two interfaces but not both.
// More on XOR: https://www.npmjs.com/package/ts-essentials#XOR
export type DatabaseMongoOption = XOR<MongoDefaultDatabasesOption, MongoOption>;
