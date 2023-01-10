import { Test } from '@nestjs/testing';
import { PetsService } from './pets.service';

describe('PetsService', () => {
	let service: PetsService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [PetsService],
		}).compile();

		service = module.get(PetsService);
	});

	it('should be defined', () => {
		expect(service).toBeTruthy();
	});
});
