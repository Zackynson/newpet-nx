import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDB } from 'aws-sdk';
import { DatabaseDynamoOption } from '../interfaces/database-dynamo-option';

@Injectable()
export class DynamoService {
	private connections = new Map<string | symbol, DynamoDB.DocumentClient>();

	constructor(private readonly configService: ConfigService) {}

	/**
	 * Creates or retrieves an existing connection identified by the token.
	 * @param {string | symbol} token identifier to create/retrieve the connection.
	 * @param {DatabaseDynamoOption} options options to be passed if we need to create the connection.
	 */
	getConnection(token: string | symbol, options?: DatabaseDynamoOption) {
		let connection = this.connections.get(token);

		if (!connection) {
			const defaultOptions = this.configService.get('databaseDefault.dynamo') || {};

			connection = new DynamoDB.DocumentClient({ ...defaultOptions, ...(options || {}) });

			this.connections.set(token, connection);
		}

		return connection;
	}
}
