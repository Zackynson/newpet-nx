import { AttributeValue, Condition, DynamoDB } from '@aws-sdk/client-dynamodb';

export class DynamoService {
	dynamoDb = new DynamoDB({});

	public async updateOne<T extends Record<string, unknown>>(
		tableName: string,
		key: Record<string, AttributeValue>,
		data: T
	) {
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

		return await this.dynamoDb.updateItem(dynamoParams);
	}

	public async putOne(tableName: string, item: Record<string, AttributeValue>) {
		const dynamoParams = {
			TableName: tableName,
			Item: item,
		};

		return await this.dynamoDb.putItem(dynamoParams);
	}

	public async getMany<T>(tableName: string, item: Record<string, Condition>): Promise<T[]> {
		const params = {
			TableName: tableName,
			KeyConditions: item,
		};
		const result = await this.dynamoDb.query(params);

		return !result.Items?.length ? [] : result.Items.map((item) => item as T);
	}

	public async getOne<T>(tableName: string, item: Record<string, AttributeValue>): Promise<T | null> {
		const params = {
			TableName: tableName,
			Key: item,
		};
		const result = await this.dynamoDb.getItem(params);

		return (result.Item as T) || null;
	}

	public async deleteOne(tableName: string, item: Record<string, AttributeValue>): Promise<void> {
		const params = {
			TableName: tableName,
			Key: item,
		};
		await this.dynamoDb.deleteItem(params);
	}
}
