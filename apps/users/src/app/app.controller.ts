import { CreateUserDTO, UpdateUserDTO } from '@libs/users';
import { BadRequestException, Body, Controller, Get, Param, Post, Put, Request } from '@nestjs/common';
import { ControllerResponse } from '@shared/interfaces';
import { Request as ExpressRequest } from 'express';

import { AppService } from './app.service';

@Controller('users')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post()
	async createUser(@Body() user: CreateUserDTO): Promise<ControllerResponse> {
		const userId = await this.appService.createUser(user);

		return {
			message: 'User successfully created',
			data: { userId },
		};
	}

	@Put(':userId')
	async updateUser(@Body() body: UpdateUserDTO, @Param('userId') userId: string) {
		if (!userId) throw new BadRequestException('userId is required');

		await this.appService.updateUser(body, userId);

		return {
			message: 'User successfully updated',
		};
	}

	@Post(':userId/avatar')
	async uploadFile(@Request() req: ExpressRequest, @Param('userId') userId: string) {
		if (!userId) throw new BadRequestException('userId is required');

		if (!req.body.file || typeof req.body.file !== 'string' || !req.body.file.length) {
			throw new BadRequestException('File must be a base64 encoded string');
		}

		const base64Data = req.body.file.replace(/^data:image\/png;base64,/, '');

		await this.appService.updateAvatar(base64Data, userId);

		return {
			message: 'Avatar successfully updated',
		};
	}

	@Get()
	async listUsers() {
		const docs = await this.appService.getUsers();

		return {
			data: docs,
		};
	}

	@Get(':userId')
	async getUserById(@Param('userId') userId) {
		const user = await this.appService.getUserById(userId);

		return {
			data: user,
		};
	}
}
