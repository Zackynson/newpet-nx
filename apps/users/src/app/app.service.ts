import { UsersService } from '@libs/users';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(@Inject(UsersService) private readonly userService: UsersService) {}

	async getData() {
		return this.userService.list();
	}
}
