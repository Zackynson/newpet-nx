import { CreatePetDTO, Pet, PetsService } from '@libs/pets';
import { UsersService } from '@libs/users';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(
		@Inject(UsersService) private readonly usersService: UsersService,
		@Inject(PetsService) private readonly petsService: PetsService
	) {}
	async listPets(): Promise<Pet[]> {
		return this.petsService.list();
	}

	async createPet(data: CreatePetDTO): Promise<string> {
		const { name } = await this.usersService.findById(data.ownerId);

		return this.petsService.create({
			pet: { ...data, owner: { name, _id: data.ownerId } },
		});
	}

	async getPetById(id: string): Promise<Pet> {
		return this.petsService.findById(id);
	}

	async uploadImage(base64FileString: string, userId: string): Promise<void> {
		await this.petsService.uploadImage(base64FileString, userId);
	}
}
