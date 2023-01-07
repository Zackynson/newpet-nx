import { Schema } from 'dynamoose';

export const RequestedServiceItemSchema = new Schema(
	{
		transactionId: {
			type: String,
			hashKey: true,
		},
		service: {
			type: String,
			rangeKey: true,
		},
		idempotencyKey: {
			type: String,
		},
		tenantId: {
			type: String,
		},
		provider: {
			type: String,
		},
		invokeCount: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);
