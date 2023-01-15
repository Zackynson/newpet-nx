import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
	let service: AppService;

	beforeAll(async () => {
		const app = await Test.createTestingModule({
			providers: [AppService],
		}).compile();

		service = app.get<AppService>(AppService);
	});

	describe('getData', () => {
		it('should return "Hello world!"', () => {
			expect(service.listPets()).toEqual({ message: 'Hello world!' });
		});
	});
});