import * as AWS from '@aws-sdk/client-lambda';
import * as AWSSTS from '@aws-sdk/client-sts';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { lastValueFrom } from 'rxjs';
import { REQUESTED_SERVICES_MODEL_NAME } from '../constants';
import { RequestedServiceItem, RequestedServiceItemTableKeys } from '../interfaces/requested-service.interface';
import { RequestServiceExecution, ServiceCrudInterface, ServiceResultInterface } from '../interfaces/service.interface';
import { DynamoService } from './dynamo';

const dynamo = new DynamoService();
process.env.SERVICES_URL =
	process.env.SERVICES_URL || 'https://dbqviy7zj3-vpce-0954463ccc1ecfbce.execute-api.us-east-1.amazonaws.com/prod';
process.env.SERVICES_CRUD_URL =
	process.env.SERVICES_CRUD_URL || 'https://hjz81l507c-vpce-0954463ccc1ecfbce.execute-api.us-east-1.amazonaws.com/dev';

@Injectable()
export class ServicesService {
	constructor(
		@InjectModel(REQUESTED_SERVICES_MODEL_NAME)
		private readonly requestedServiceItemModel: Model<RequestedServiceItem, RequestedServiceItemTableKeys>,
		private readonly httpService: HttpService
	) {}

	sts = new AWSSTS.STS({ region: process.env.AWS_REGION });
	stsParams = {
		RoleArn: 'arn:aws:iam::133899610904:role/OrchestratorDevInvokeLambda',
		DurationSeconds: 3600,
		RoleSessionName: 'OrchestratorServices',
	};

	/*
	 * calls usages-api to get the list of international services (could it not be directly services CRUD endpoint??)
	 */
	async getAllServices(tenantId: string): Promise<ServiceCrudInterface> {
		const url = `${process.env.SERVICES_CRUD_URL}/price/${tenantId}?_international=true`;

		//TODO: cache results to improve performance
		const response = await lastValueFrom(this.httpService.get(url));

		return response.data;
	}

	async callServicesLambda(data: RequestServiceExecution): Promise<ServiceResultInterface> {
		const stsResults = await this.sts.assumeRole(this.stsParams);
		const lambda = new AWS.Lambda({
			region: process.env.AWS_REGION,
			maxAttempts: 1,
			credentials: {
				accessKeyId: stsResults.Credentials?.AccessKeyId || '',
				secretAccessKey: stsResults.Credentials?.SecretAccessKey || '',
				sessionToken: stsResults.Credentials?.SessionToken || '',
			},
			//TODO: find equivalent in SDK-V3
			//httpOptions: { timeout: 0.9 * 60 * 1000 },
		});

		const functionName = `arn:aws:lambda:us-east-1:133899610904:function:datasources-${process.env.STAGE}-create`;

		const params = {
			FunctionName: functionName,
			Payload: fromUtf8(JSON.stringify({ ...data })),
		};
		console.log('invoke', params);
		const result = await lambda.invoke(params);

		return result.Payload ? JSON.parse(toUtf8(result.Payload)) : {};
	}

	/**
	 * Calls datasources-api to request a service execution. The request will be inserted in a queue and
	 * processed when possible. Furter calls to the api with the same parameters will return the
	 * data (if already processed) or info about the queue(statusCode 05).
	 */
	async requestServiceExecution(data: RequestServiceExecution, sync = false): Promise<ServiceResultInterface> {
		//TODO: for now it will be sync, but in the future this will always be async
		if (sync) {
			return this.callServicesLambda(data);
		}
		const url = `${process.env.SERVICES_URL}/create`;
		const config = {
			headers: { 'Content-Type': 'application/json' },
		};

		const response = await lastValueFrom(this.httpService.post(url, data, config));

		return {
			status: response.status,
			data: response.data,
		};
	}

	/**
	 * Inserts or updates a service execution request.
	 * Important for persist idempotencyKey, that allows to recover data from datasources-api if needed
	 */
	async generateAndPersistRequestService(
		transactionId: string,
		service: string,
		provider: string,
		idempotencyKey: string,
		exists: boolean,
		invokeCount: number
	): Promise<RequestedServiceItem> {
		const requestedServiceData: RequestedServiceItem = {
			transactionId,
			service,
			provider,
			idempotencyKey,
			invokeCount,
		};

		console.log('Save requested service item attempt', requestedServiceData);
		if (exists) {
			await this.requestedServiceItemModel.update(requestedServiceData);
			console.log('update item');
		} else {
			await this.requestedServiceItemModel.create(requestedServiceData);
			console.log('Save requested service item success', requestedServiceData.transactionId);
		}

		return requestedServiceData;
	}

	/**
	 * Verify and get the service if it has been already requested for the transaction
	 */
	async getExistingRequestService(transactionId: string, service: string): Promise<RequestedServiceItem> {
		const item = await this.requestedServiceItemModel.get({ transactionId, service });
		return item;
	}

	/**
	 * Generates a idempotencyKey, which guarantees that the same service will not be processed twice
	 * for the same transaction.
	 */
	async createIdempotencyKey(transactionId: string, data: any) {
		const retry = data?.invokeCount || 0;
		return transactionId + ':' + retry;
	}
}
