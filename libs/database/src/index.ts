/**
 * @module Database
 */
export * from './lib/database.module';
export * from './lib/mongodb/index';
export * from './lib/dynamodb/index';
export * from './lib/dynamodb/services/dynamo-manager.service';
export * from './lib/dynamoose/index';
export * from './lib/enums/database-type.enum';
export { DefaultDatabaseConfig as DatabaseConfig } from './lib/configuration';
