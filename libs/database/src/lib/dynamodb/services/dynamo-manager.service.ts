import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { DynamoDB } from 'aws-sdk';

@Injectable()
export class DynamoManagerService {
	constructor(
		@InjectAwsService(DynamoDB.DocumentClient)
		private readonly dynamoDb: DynamoDB.DocumentClient
	) {}

	public async updateOne<T extends Record<string, unknown>>(tableName: string, key: DynamoDB.DocumentClient.Key, data: T) {
		const dynamoParams = {
			TableName: tableName,
			Key: key,
			AttributeUpdates: {},
		};

		Object.keys(data).forEach((k) => {
			dynamoParams.AttributeUpdates[k] = {
				Action: 'PUT',
				Value: data[k],
			};
		});

		return this.dynamoDb.update(dynamoParams).promise();
	}

	public async putOne(tableName: string, item: DynamoDB.DocumentClient.PutItemInputAttributeMap) {
		const dynamoParams = {
			TableName: tableName,
			Item: item,
		};

		return this.dynamoDb.put(dynamoParams).promise();
	}

	public async getMany<T>(params: DynamoDB.DocumentClient.QueryInput): Promise<T[]> {
		const result = await this.dynamoDb.query(params).promise();

		return !result.Items?.length ? [] : result.Items.map((item) => item as T);
	}

	public async getOne<T>(params: DynamoDB.DocumentClient.GetItemInput): Promise<T | null> {
		const result = await this.dynamoDb.get(params).promise();

		return (result.Item as T) || null;
	}

	public async deleteOne(params: DynamoDB.DocumentClient.DeleteItemInput): Promise<void> {
		await this.dynamoDb.delete(params).promise();
	}
}
