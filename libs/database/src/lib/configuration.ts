import { registerAs } from '@nestjs/config';
import { DatabaseDynamoOption } from './dynamodb';
import { defaultOptions as mongoDefaultOptions, MongoDefaultOptions } from './mongodb/mongo.configuration';
import { defaultOptions as dynamoDefaultOptions } from './dynamodb/dynamo.configuration';
import {
	defaultOptions as dynamooseDefaultOptions,
	DefaultDatabaseDynamooseOption,
} from './dynamoose/dynamoose.configuration';

export interface DefaultDatabaseConfig {
	mongo: MongoDefaultOptions;
	dynamo: DatabaseDynamoOption;
	dynamoose: DefaultDatabaseDynamooseOption;
}

export default registerAs(
	'databaseDefault',
	() =>
		({
			mongo: mongoDefaultOptions(),
			dynamo: dynamoDefaultOptions(),
			dynamoose: dynamooseDefaultOptions(),
		} as DefaultDatabaseConfig)
);
