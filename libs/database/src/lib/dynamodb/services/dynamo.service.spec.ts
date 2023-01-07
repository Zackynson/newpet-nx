import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamoService } from './dynamo.service';
import databaseConfig from '../../configuration';

describe('DynamoService', () => {
	let service: DynamoService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forFeature(databaseConfig)],
			providers: [DynamoService],
		}).compile();

		service = module.get<DynamoService>(DynamoService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
