import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsNotEmpty()
	confirmPassword: string;
}
