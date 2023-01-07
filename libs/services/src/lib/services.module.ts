import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { REQUESTED_SERVICES_MODEL_NAME } from './constants';
import { RequestedServiceItemSchema } from './schemas/requested-service-item.schema';
import { ServicesService } from './services/services.service';

import * as logger from 'dynamoose-logger';
try {
	logger.status;
} catch (e) {
	//
}

process.env.IS_DDB_LOCAL = process.env.IS_DDB_LOCAL || 'false';
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
@Module({
	imports: [
		DynamooseModule.forRoot({
			local: process.env.IS_DDB_LOCAL === 'true' ? 'http://localhost:8008' : false,
			aws: {
				region: process.env.AWS_REGION,
			},
			logger: true,
		}),

		DynamooseModule.forFeature([
			{
				name: REQUESTED_SERVICES_MODEL_NAME,
				schema: RequestedServiceItemSchema,
				options: { create: process.env.IS_DDB_LOCAL === 'true', prefix: 'newpet-dev-' },
			},
		]),
		HttpModule,
	],
	providers: [ServicesService],
	exports: [ServicesService],
})
export class ServicesModule {}
