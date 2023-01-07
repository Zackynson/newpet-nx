import { DatabaseDynamooseOption } from './interfaces/database-dynamoose-option';

export type DefaultDatabaseDynamooseOption = Omit<DatabaseDynamooseOption, 'type'>;

export function defaultOptions(): DefaultDatabaseDynamooseOption {
	return {
		connection: {
			aws: {
				region: process.env.AWS_REGION,
			},
		},
	};
}
