import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PetSize } from '../enums/pet-size.enum';
import { PetType } from '../enums/pet-type.enum';

/**
 * Pets interface
 */
export class UpdatePetDTO {
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
	address: string;

	@IsString()
	@IsNotEmpty()
	@IsEnum(PetSize)
	size: PetSize;
}
