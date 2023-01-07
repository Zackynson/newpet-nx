import { CreateUserDTO, UsersService } from '@libs/users';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(@Inject(UsersService) private readonly userService: UsersService) {}

	async createUser(user: CreateUserDTO): Promise<string> {
		return this.userService.create({
			user,
		});
	}

	async getUsers() {
		return this.userService.list();
	}
}
