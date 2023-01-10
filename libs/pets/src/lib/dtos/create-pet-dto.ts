import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PetType } from '../enums/pet-type.enum';

/**
 * Pets interface
 */
export class CreatePetDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	@IsEnum(PetType)
	type: PetType;

	@IsString()
	@IsNotEmpty()
	breed: string;

	@IsString()
	@IsNotEmpty()
	birthDate: string;

	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	ownerId: string;
}
