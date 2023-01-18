import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
		message: 'Confirmação de senha não pode ser vazia',
	})
	confirmPassword: string;

	@IsOptional()
	@IsNumberString({}, { message: 'Telefone deve ser uma string numérica' })
	@IsNotEmpty({ message: 'Telefone nao pode ser vazio' })
	@MinLength(10, { message: 'Telefone deve ter no minimo 11 digitos' })
	@MaxLength(11, { message: 'Telefone deve ter no máximo 11 digitos' })
	phone: string;
}
