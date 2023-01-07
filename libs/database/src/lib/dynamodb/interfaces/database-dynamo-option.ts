import { DynamoDB } from 'aws-sdk';
import { DatabaseOptions } from '../../interfaces/database-options.interface';
/**
 * Type to define a new custom connection
 */
export type DatabaseDynamoOption = DynamoDB.DocumentClient.DocumentClientOptions &
	DynamoDB.ClientApiVersions &
	DynamoDB.Types.ClientConfiguration &
	DatabaseOptions;
