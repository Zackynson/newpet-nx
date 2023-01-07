import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { MongoOption } from '../interfaces/database-mongo-option';

@Injectable()
export class MongoService implements OnApplicationShutdown {
	private connections = new Map<string | symbol, MongoClient>();

	constructor(private readonly configService: ConfigService) {}

	/**
	 * Creates or retrieves an existing connection identified by the token.
	 * @param {string | symbol} token identifier to create/retrieve the connection.
	 * @param {MongoClientOptions} options options to be passed if we need to create the connection.
	 * If the connection already exists, the options argument is ignored. If not, the options is merged
	 * with the `databaseDefault` config;
	 */
	getConnection(token: string | symbol, options?: Pick<MongoOption, 'uri' | 'clientOptions'>) {
		let connection = this.connections.get(token);

		if (!connection) {
			if (!options?.uri) throw new Error("Argument 'options' must be provided for a new connection.");

			const defaultOptions = this.configService.get('databaseDefault.mongo.clientOptions') || {};
			const clientOptions = options.clientOptions || {};

			connection = new MongoClient(options.uri, { ...defaultOptions, ...clientOptions });

			this.connections.set(token, connection);
		}

		return connection;
	}

	async onApplicationShutdown() {
		return await Promise.all([...this.connections.values()].map((c) => c.close()));
	}
}
