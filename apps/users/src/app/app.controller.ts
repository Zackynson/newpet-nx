import { CreateUserDTO } from '@libs/users';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ControllerResponse } from '@shared/interfaces';

import { AppService } from './app.service';

@Controller('users')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post()
	async createUser(@Body() user: CreateUserDTO): Promise<ControllerResponse> {
		const userId = await this.appService.createUser(user);

		return {
			message: 'User created successfully',
			data: { userId },
		};
	}

	@Get()
	async getData() {
		const docs = await this.appService.getUsers();

		return {
			data: { ...docs },
		};
	}
}
