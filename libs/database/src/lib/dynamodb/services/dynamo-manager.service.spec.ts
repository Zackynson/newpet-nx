import { Test, TestingModule } from '@nestjs/testing';
import { DynamoManagerService } from './dynamo-manager.service';
import { DynamoDB } from 'aws-sdk';

import { createAwsServiceMock, createAwsServicePromisableSpy, getAwsServiceMock } from 'nest-aws-sdk/dist/testing';

describe('DynamoManagerService', () => {
	let service: DynamoManagerService;
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			providers: [
				DynamoManagerService,
				createAwsServiceMock(DynamoDB.DocumentClient, {
					useValue: {
						update: () => ({
							promise: () => null,
						}),
						put: () => ({
							promise: () => null,
						}),
						query: () => ({
							promise: () => null,
						}),
						get: () => ({
							promise: () => null,
						}),
						delete: () => ({
							promise: () => null,
						}),
					},
				}),
			],
		}).compile();

		service = module.get<DynamoManagerService>(DynamoManagerService);
	});

	describe('updateOne', () => {
		it('should call update method with correct params', async () => {
			const dynamoUpdateSpy = createAwsServicePromisableSpy(
				getAwsServiceMock(module, DynamoDB.DocumentClient),
				'update',
				'resolve',
				null
			);

			await service.updateOne('TEST_TABLE', 'key_test' as unknown as DynamoDB.DocumentClient.Key, { testAtt: true });

			expect(dynamoUpdateSpy).toHaveBeenCalledTimes(1);
			expect(dynamoUpdateSpy).toHaveBeenCalledWith({
				TableName: 'TEST_TABLE',
				Key: 'key_test',
				AttributeUpdates: {
					testAtt: {
						Action: 'PUT',
						Value: true,
					},
				},
			});
		});
	});

	describe('putOne', () => {
		it('should call put method with correct params', async () => {
			const dynamoPutSpy = createAwsServicePromisableSpy(
				getAwsServiceMock(module, DynamoDB.DocumentClient),
				'put',
				'resolve',
				null
			);

			await service.putOne('TEST_TABLE', {
				test: true,
			});

			expect(dynamoPutSpy).toHaveBeenCalledTimes(1);
			expect(dynamoPutSpy).toHaveBeenCalledWith({
				TableName: 'TEST_TABLE',
				Item: {
					test: true,
				},
			});
		});
	});

	describe('getMany', () => {
		it('should call query method with correct params', async () => {
			const dynamoQuerySpy = createAwsServicePromisableSpy(
				getAwsServiceMock(module, DynamoDB.DocumentClient),
				'query',
				'resolve',
				{
					Count: 0,
				}
			);

			await service.getMany({
				TableName: 'TEST_TABLE',
				IndexName: 'testIndex',
				Limit: 10,
			});

			expect(dynamoQuerySpy).toHaveBeenCalledTimes(1);
			expect(dynamoQuerySpy).toHaveBeenCalledWith({
				TableName: 'TEST_TABLE',
				IndexName: 'testIndex',
				Limit: 10,
			});
		});

		it('should return an empty array when query method returns no data', async () => {
			createAwsServicePromisableSpy(getAwsServiceMock(module, DynamoDB.DocumentClient), 'query', 'resolve', {
				Count: 0,
			});

			const response = await service.getMany({
				TableName: 'TEST_TABLE',
				IndexName: 'testIndex',
				Limit: 10,
			});

			expect(response).toEqual([]);
			expect(response.length).toBe(0);
		});

		it('should return items correctly when query method returns data', async () => {
			createAwsServicePromisableSpy(getAwsServiceMock(module, DynamoDB.DocumentClient), 'query', 'resolve', {
				Count: 2,
				Items: [
					{
						ok: true,
					},
					{
						ok: false,
					},
				],
			});

			const response = await service.getMany({
				TableName: 'TEST_TABLE',
				IndexName: 'testIndex',
				Limit: 10,
			});

			expect(response).toEqual([
				{
					ok: true,
				},
				{
					ok: false,
				},
			]);
			expect(response.length).toBe(2);
		});
	});

	describe('getOne', () => {
		it('should call get method with correct params', async () => {
			const dynamoQuerySpy = createAwsServicePromisableSpy(
				getAwsServiceMock(module, DynamoDB.DocumentClient),
				'get',
				'resolve',
				{
					Item: null,
				}
			);

			await service.getOne({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});

			expect(dynamoQuerySpy).toHaveBeenCalledTimes(1);
			expect(dynamoQuerySpy).toHaveBeenCalledWith({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});
		});

		it('should return null when get method returns no data', async () => {
			createAwsServicePromisableSpy(getAwsServiceMock(module, DynamoDB.DocumentClient), 'get', 'resolve', {});

			const response = await service.getOne({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});

			expect(response).toBe(null);
		});

		it('should return item correctly when get method returns data', async () => {
			createAwsServicePromisableSpy(getAwsServiceMock(module, DynamoDB.DocumentClient), 'get', 'resolve', {
				Item: {
					ok: true,
					test: true,
				},
			});

			const response = await service.getOne({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});

			expect(response).toEqual({
				ok: true,
				test: true,
			});
		});
	});

	describe('deleteOne', () => {
		it('should call delete method with correct params', async () => {
			const dynamoDeleteSpy = createAwsServicePromisableSpy(
				getAwsServiceMock(module, DynamoDB.DocumentClient),
				'delete',
				'resolve',
				null
			);

			await service.deleteOne({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});

			expect(dynamoDeleteSpy).toHaveBeenCalledTimes(1);
			expect(dynamoDeleteSpy).toHaveBeenCalledWith({
				TableName: 'TEST_TABLE',
				Key: {
					id: '12345',
				},
			});
		});
	});
});
