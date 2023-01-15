import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString({
		message: 'Email deve ser uma string',
	})
	@IsNotEmpty({
		message: 'Email não pode ser vazio',
	})
	@IsEmail({
		message: 'Email inválido',
	})
	email: string;

	@IsString({
		message: 'Senha deve ser uma string',
	})
	@IsNotEmpty({
		message: 'Senha não pode ser vazio',
	})
	password: string;

	@IsString({
		message: 'Confirmação de senha deve ser uma string',
	})
	@IsNotEmpty({
		message: 'Confirmação de senha não pode ser vazio',
	})
	confirmPassword: string;
}
