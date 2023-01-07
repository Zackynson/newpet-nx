import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoService } from './mongo.service';
import databaseConfig from '../../configuration';

describe('MongoService', () => {
	let service: MongoService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forFeature(databaseConfig)],
			providers: [MongoService],
		}).compile();

		service = module.get<MongoService>(MongoService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
