import { CreateUserDTO, UpdateUserDTO } from '@libs/users';
import { BadRequestException, Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ControllerResponse } from '@shared/interfaces';

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

	@UseGuards(AuthGuard('jwt'))
	@Put()
	async updateUser(@Body() body: UpdateUserDTO, @Request() req: any) {
		await this.appService.updateUser(body, req.user?.id);

		return {
			message: 'User successfully updated',
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('avatar')
	async uploadFile(@Request() req: any) {
		if (!req.body.file || typeof req.body.file !== 'string' || !req.body.file.length) {
			throw new BadRequestException('File must be a base64 encoded string');
		}

		const base64Data = req.body.file.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

		const url = await this.appService.updateAvatar(base64Data, req.user?.id);

		return {
			message: 'Avatar successfully updated',
			data: { url },
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Get()
	async listUsers() {
		const docs = await this.appService.getUsers();

		return {
			data: docs,
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Get(':userId')
	async getUserById(@Param('userId') userId) {
		const user = await this.appService.getUserById(userId);

		return {
			data: user,
		};
	}
}
