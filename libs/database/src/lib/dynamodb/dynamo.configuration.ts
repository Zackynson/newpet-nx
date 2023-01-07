import { DatabaseDynamoOption } from './interfaces/database-dynamo-option';

export type DefaultDatabaseDynamoOption = Omit<DatabaseDynamoOption, 'type'>;

export function defaultOptions(): DefaultDatabaseDynamoOption {
	return {
		convertEmptyValues: true,
		region: 'us-east-1',
	};
}
