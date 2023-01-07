import { DynamooseModuleOptions, ModelDefinition } from 'nestjs-dynamoose';
import { DatabaseOptions } from '../../interfaces/database-options.interface';

/**
 * Type to define a new custom connection
 */
export type DatabaseDynamooseOption = {
	connection?: DynamooseModuleOptions;
	models?: ModelDefinition[];
} & DatabaseOptions;
