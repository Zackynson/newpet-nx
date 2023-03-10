import { CreatePetDTO, ListPetsFilterDTO, Pet, PetsService, UpdatePetDTO } from '@libs/pets';
import { UsersService } from '@libs/users';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(
		@Inject(UsersService) private readonly usersService: UsersService,
		@Inject(PetsService) private readonly petsService: PetsService
	) {}
	async listPets(filter: ListPetsFilterDTO): Promise<Pet[]> {
		return this.petsService.list(filter);
	}

	async createPet(data: CreatePetDTO, ownerId: string): Promise<string> {
		const { name } = await this.usersService.findById(ownerId);

		return this.petsService.create({
			pet: { ...data, ownerId, owner: { name, _id: ownerId } },
		});
	}

	async getPetById(id: string): Promise<Pet> {
		return this.petsService.findById(id);
	}

	async uploadImage(base64FileString: string, petId: string, ownerId: string): Promise<void> {
		await this.petsService.uploadImage(base64FileString, petId, ownerId);
	}

	async deleteImage(imageUrl: string, petId: string, ownerId: string): Promise<void> {
		await this.petsService.deleteImage(imageUrl, petId, ownerId);
	}

	async updatePet(data: UpdatePetDTO, petId: string, ownerId: string): Promise<void> {
		await this.petsService.updatePet(data, petId, ownerId);
	}
}
