import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

/**
 * Module that has the default configurations for connecting
 * with Mongo.
 *
 * Note that this is just a module that makes it easy to set up
 * the mongo configuration by encapsulating all the boiler plate.
 */
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: () => {
				if (!process.env.MONGO_URI) {
					throw new Error('MONGO_URI env variable must be set');
				}

				return {
					uri: process.env.MONGO_URI,
					retryAttempts: 3,
					retryDelay: 1000,
				} as MongooseModuleFactoryOptions;
			},
		}),
	],
})
export class MongooseDefaultModule {}
