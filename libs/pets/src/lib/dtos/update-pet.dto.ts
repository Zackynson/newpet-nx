import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PetAge } from '../enums/pet-age.enum';
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
	address: string;

	@IsString()
	@IsNotEmpty()
	@IsEnum(PetSize)
	size: PetSize;

	@IsString()
	@IsNotEmpty()
	gender: string;

	@IsString()
	@IsNotEmpty()
	@IsEnum(PetAge)
	age: PetAge;
}
