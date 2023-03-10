import { CreateUserDTO, UpdateUserDTO, UsersService } from '@libs/users';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(@Inject(UsersService) private readonly userService: UsersService) {}

	async createUser(user: CreateUserDTO): Promise<string> {
		if (user.confirmPassword !== user.password) {
			throw new BadRequestException('Password and confirm password are not the same');
		}

		return this.userService.create({
			user,
		});
	}

	async updateAvatar(base64FileString: string, userId: string): Promise<string> {
		return this.userService.updateAvatar(base64FileString, userId);
	}

	async updateUser(data: UpdateUserDTO, userId: string): Promise<void> {
		return this.userService.updateUser(data, userId);
	}

	async getUsers() {
		return this.userService.list();
	}

	async getUserById(userId: string) {
		return this.userService.findById(userId);
	}
}
