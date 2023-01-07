import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDB } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
// import { MongooseModule } from '@nestjs/mongoose';
import { DynamooseModule, DynamooseModuleOptions } from 'nestjs-dynamoose';

import databaseConfig from './configuration';
import { DatabaseType } from './enums/database-type.enum';
import { DatabaseMongoOption, MongoDefaultDatabasesOption } from './mongodb/interfaces/database-mongo-option';
import { MongoService } from './mongodb/services/mongo.service';

import { DatabaseDynamoOption, DynamoService } from './dynamodb';
import { DefaultDatabaseDynamoOption, defaultOptions as dynamoDefaultOptions } from './dynamodb/dynamo.configuration';
import { DynamoManagerService } from './dynamodb/services/dynamo-manager.service';

import { DatabaseDynamooseOption } from './dynamoose';
import { defaultOptions as dynamooseDefaultOptions } from './dynamoose/dynamoose.configuration';

export type DatabaseModuleOption = DatabaseMongoOption | DatabaseDynamoOption | DatabaseDynamooseOption;

/**
 * # DatabaseModule
 *
 * A Module that connects into the desired database and register connections in the depedency injection container.
 *
 * ## How to use
 *
 * ### Simple use
 * The easiest way to use it is to import it in your module, for example:
 *
 * @example
 * ```ts
 * import { Module } from '@nestjs/common';
 * import { DatabaseModule, DatabaseType } from '@libs/database';
 *
 * ＠Module({
 *   imports: [DatabaseModule],
 * })
 * export class AppModule {}
 * ```
 *
 * This would also register a `databaseDefault` configuration in the [ConfigService](https://docs.nestjs.com/techniques/configuration#using-the-configservice). Those would be default options that might be useful to you in case you want to access some default database configuration.
 *
 * > **⚠️ WARNING: You SHOULD NOT [load](https://docs.nestjs.com/techniques/configuration#custom-configuration-files) any `databaseDefault` key into the root of the ConfigModule as this would overwrite the `databaseDefault` configs we register in the {@link DatabaseModule}**.
 *
 * ### Using default Databases
 *
 * This module comes with the possibility of using default configurations that might be present in the
 * lambda function environment variables. Normally lambdas might have either `TRUST_MONGO_CLUSTER_URI` or `CAF_MONGO_CLUSTER_URI` and in this case we can pass a configuration allowing the module to automatically create the connections for those URIs.
 *
 * @example
 * ```ts
 * import { DatabaseModule, DatabaseType } from '@libs/database';
 * import { Module } from '@nestjs/common';
 * import { AppController } from './app.controller';
 * import { AppService } from './app.service';
 * ＠Module({
 * 	imports: [
 * 		DatabaseModule.forRoot([
 * 			{
 * 				type: DatabaseType.MONGODB,
 * 				useCAF: true,
 * 			},
 * 		]),
 *  ],
 * 	controllers: [AppController],
 *  providers: [AppService],
 * })
 * export class AppModule {}
 *
 * ```
 *
 * In this case, the {@link DatabaseModule#forRoot} method would create a connection using the `CAF_MONGO_CLUSTER_URI` and the DB and Connection would be available via DI and can be retrieved as the example below. Also note that the `type` property is mandatory since we might have another type of Database connections.
 *
 * You can now inject the mongoose models via constructor to use them as the CatModel example below
 * See more at: https://docs.nestjs.com/techniques/mongodb
 *
 * @example
 * ```ts
 * import { Db, MongoClient } from 'mongodb';
 * import { InjectClient, InjectDb } from 'nest-mongodb';
 * import { Cat, CatDocument } from './cat.schema';
 *
 * ...
 * 	constructor(@InjectModel('Cat.name', 'cats') private catModel: Model<CatDocument>) {}
 * ```
 *
 * > **ℹ️ NOTE: You do not need to inject the connection if you do not need to access specific connection underlying methods. It is totally fine just to inject the DB. The default DB that is connected is the `admindb` that is present both in the TRUST and CAF databases.**
 *
 * If you need to access another database using the connection that was already stablished you will indeed need to inject the connection. Following the example above we would do:
 *
 * @example
 * ```ts
 * async fetchClientAndAdminData(tenantId: string) {
 *   const clientDB = this.cafMongoClient.db(tenantId);
 *   // NOTE: There is no need to open a new connection to access another DB.
 *   // The MongoClient.db creates a new Db instance sharing the current socket connections.
 *   return {
 *     data: await clientDB.collection('data').find().toArray(),
 *     config: await cafMongoDb.collection('executions').findOne({ tenantId }),
 *   };
 * }
 * ```
 *
 * If you also needed to connect to the `admindb` of the Trust cluster, you could add the `useTrust: true` and inject the DB using the `TRUS_MONGO_CONNECTION` token. Refer to the {@link MongoDefaultDatabasesOption} interface to see full interface for using default databases.
 *
 * This module also enables you to connect on Amazon DynamoDb via forRoot method, using Dynamoose ORM for NestJS to stablish connection and perform query operations. You can specify some connection options and the models you want to create. By default Dynamo connection will only use `AWS_REGION` lambda's variable to define the region to connect.
 *
 * @example
 * ```ts
 * import { DatabaseModule, DatabaseType } from '@libs/database';
 * import { Schema } from 'dynamoose';
 * import { Module } from '@nestjs/common';
 * import { AppController } from './app.controller';
 * import { AppService } from './app.service';
 * ＠Module({
 * 	imports: [
 * 		DatabaseModule.forRoot([
 * 			{
 * 				type: DatabaseType.DYNAMOOSE,
 * 				models: [{ name: 'Dog', schema: new Schema({ name: String, id: String }) }],
 * 			},
 * 		]),
 *  ],
 * 	controllers: [AppController],
 *  providers: [AppService],
 * })
 * export class AppModule {}
 *
 * ```
 *
 * As you can see in the exemple above, it's just required to provide the database type you want to connect to, alongside the models you would like to load from this module.
 * The models you choose to create in database module will be available to be used inside your services by DI. More information can be found at https://github.com/hardyscc/nestjs-dynamoose
 *
 * @example
 * ```ts
 * import { InjectModel, Model } from 'nestjs-dynamoose';
 * import { Dog, DogKey } from '../interfaces/dog.interface';
 *
 * ...
 * constructor(@InjectModel('Dog') private dogModel: Model<Dog, DogKey>) {}
 *
 * ```
 *
 * ### Custom connections
 *
 * Sometimes you might need to connect to a database other than the default ones. In this case it is very simple, you just need to pass an object as defined by the interface {@link MongoOption}.
 *
 * @example
 * ```ts
 * import { Module } from '@nestjs/common';
 * import { DatabaseModule, DatabaseType } from '@libs/database';
 *
 * ＠Module({
 *   imports: [
 *     DatabaseModule.forRoot([
 *       {
 *         type: DatabaseType.MONGODB,
 *         uri: 'mongodb://mongodb0.dogs.com:27017',
 *         database: 'mydb',
 *         connectionName: 'dogs-connection',
 *         // Those client options would be merged with the default clientOptions
 *         // exposed by this module.
 *         clientOptions: {
 *           appName: 'dogs-lambda',
 *         }
 *       },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * You can see what are the default options that will be merged with the clientOptions
 * passed in the configuration object above here {@link mongoConfig}.
 *
 * > **💡 HINT: You normally would add the `connectionName` in a list of constants so you can
 * re-use it when injecting the connection/database.**
 */
@Module({
	imports: [ConfigModule.forFeature(databaseConfig)],
	providers: [MongoService, DynamoService],
	exports: [MongoService, DynamoService],
})
export class DatabaseModule {
	static forRoot(options: DatabaseModuleOption[]): DynamicModule {
		const imports: ModuleMetadata['imports'] = [];
		const providers: ModuleMetadata['providers'] = [];
		const moduleExports: ModuleMetadata['exports'] = [];

		for (const option of options) {
			// if (DatabaseModule.isMongoDBOption(option)) {
			// 	const dynamicModuleOptions: MongoOption[] = [];
			// 	const defaultOptions = mongoDefaultOptions();

			// 	if (DatabaseModule.isMongoDefaultOption(option)) {
			// 		if (option.useCAF) dynamicModuleOptions.push(defaultOptions.caf);
			// 		if (option.useTRUST) dynamicModuleOptions.push(defaultOptions.trust);
			// 	} else {
			// 		dynamicModuleOptions.push(option);
			// 	}

			// 	const createdModules = dynamicModuleOptions.map((o) =>
			// 		MongooseModule.forRoot(o.uri, {
			// 			...defaultOptions.clientOptions,
			// 			...o.clientOptions,
			// 		})
			// 	);

			// 	imports.push(...createdModules);
			// }else
			if (DatabaseModule.isDynamoDBOption(option)) {
				const dynamicModuleOptions: DefaultDatabaseDynamoOption[] = [];
				const defaultOptions = dynamoDefaultOptions();

				dynamicModuleOptions.push({ ...defaultOptions, ...option });
				const createdModules = dynamicModuleOptions.map((option) =>
					AwsSdkModule.forRoot({
						services: [
							{
								service: DynamoDB.DocumentClient,
								serviceOptions: option,
							},
						],
					})
				);

				imports.push(...createdModules);

				moduleExports.push(DynamoManagerService);
				providers.push(DynamoManagerService);
			} else if (DatabaseModule.isDynamooseDBOption(option)) {
				const { connection, models } = option;
				const dynamicModuleOptions: DynamooseModuleOptions[] = [];
				const defaultOptions = dynamooseDefaultOptions();

				dynamicModuleOptions.push({ ...connection, ...defaultOptions.connection });
				const createdModules = dynamicModuleOptions.map((option) => DynamooseModule.forRoot(option));

				imports.push(...createdModules);

				const forFeatureModule = DynamooseModule.forFeature(models);

				imports.push(forFeatureModule);
			}
			/** NOTE: If we had other Databases we would include them here with a else if. */
		}

		return {
			module: DatabaseModule,
			imports,
			exports: moduleExports,
			providers,
		};
	}

	/**
	 * Type Guards
	 */

	private static isMongoDBOption(option: DatabaseModuleOption): option is DatabaseMongoOption {
		return option.type === DatabaseType.MONGODB;
	}

	private static isMongoDefaultOption(option: DatabaseMongoOption): option is MongoDefaultDatabasesOption {
		return !!(option as MongoDefaultDatabasesOption).useCAF || !!(option as MongoDefaultDatabasesOption).useTRUST;
	}

	private static isDynamoDBOption(option: DatabaseModuleOption): option is DatabaseDynamoOption {
		return option.type === DatabaseType.DYNAMODB;
	}

	private static isDynamooseDBOption(option: DatabaseModuleOption): option is DatabaseDynamooseOption {
		return option.type === DatabaseType.DYNAMOOSE;
	}
}
