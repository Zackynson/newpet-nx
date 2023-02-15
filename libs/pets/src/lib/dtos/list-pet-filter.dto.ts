import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PetAge } from '../enums/pet-age.enum';
import { PetSize } from '../enums/pet-size.enum';
import { PetType } from '../enums/pet-type.enum';

/**
 * Pets interface
 */
export class ListPetsFilterDTO {
	@IsOptional()
	@IsString()
	@IsEnum(PetType)
	type?: PetType;

	@IsString()
	@IsOptional()
	breed?: string;

	@IsOptional()
	@IsString()
	address?: string;

	@IsOptional()
	@IsString()
	@IsEnum(PetSize)
	size?: PetSize;

	@IsOptional()
	@IsString()
	@IsEnum(PetAge)
	age?: PetAge;

	@IsOptional()
	@IsString()
	gender?: string;
}
