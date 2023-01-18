import { IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsNumberString({}, { message: 'Telefone deve ser uma string numérica' })
	@IsNotEmpty({ message: 'Telefone nao pode ser vazio' })
	@MinLength(10, { message: 'Telefone deve ter no minimo 11 digitos' })
	@MaxLength(11, { message: 'Telefone deve ter no máximo 11 digitos' })
	phone: string;
}
