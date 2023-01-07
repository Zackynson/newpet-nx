import { TransactionSchemaVersion } from '@libs/transactions';
import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { of } from 'rxjs';
import { v4 } from 'uuid';
import { RequestServiceExecution } from '../interfaces/service.interface';
import { ServicesModule } from '../services.module';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
	let service: ServicesService;
	let httpService: HttpService;

	beforeEach(async () => {
		jest.setTimeout(60000);

		const module = await Test.createTestingModule({
			imports: [ServicesModule],
		}).compile();
		service = module.get<ServicesService>(ServicesService);
		httpService = module.get<HttpService>(HttpService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
		expect(httpService).toBeDefined();
	});

	it('should return international services list', async () => {
		// Arrange

		// Act
		const result = await service.getAllServices('');
		console.log(result);
		// Assert
		expect(result).toBeDefined();
	});

	it('should create with success', async () => {
		// Arrange
		const transaction = {
			_id: new Types.ObjectId(),
			schemaVersion: TransactionSchemaVersion.v0_1_0,
			correlationId: new ObjectId(),
			workflowId: new ObjectId(),
			workflow: { status: 'PROCESSING' },
			status: 'PROCESSING',
			sections: {
				data: {},
			},
			//files: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			//validations: [],
			parameters: {},
			createdBy: new ObjectId(),
			idempotencyKey: v4(),
			service: 'facematch',
		};
		// Act
		const result = await service.requestServiceExecution(transaction as unknown as RequestServiceExecution, true);
		// Assert
		console.log('result', JSON.stringify(result));
		expect(result).toBeTruthy();
	});
	it('should return error 500', async () => {
		// Arrange
		const transaction = {
			_id: new Types.ObjectId(),
			schemaVersion: TransactionSchemaVersion.v0_1_0,
			correlationId: new ObjectId(),
			workflowId: new ObjectId(),
			workflow: { status: 'PROCESSING' },
			status: 'PROCESSING',
			sections: {
				data: {},
			},
			//files: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			//validations: [],
			parameters: {},
			createdBy: new ObjectId(),
			idempotencyKey: v4(),
			service: 'facematch',
		};
		jest
			.spyOn(httpService, 'post')
			.mockReturnValueOnce(of({ status: 500, statusText: 'INTERNAL_SERVER_ERROR', config: {}, headers: {}, data: '' }));
		// Act
		const result = await service.requestServiceExecution(transaction as unknown as RequestServiceExecution, true);
		// Assert
		expect(result).toBeFalsy();
	});
});
