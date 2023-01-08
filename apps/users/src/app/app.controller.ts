import { CreateUserDTO } from '@libs/users';
import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ControllerResponse } from '@shared/interfaces';
import { S3 } from 'aws-sdk';
// This is a hack to make Multer available in the Express namespace
import 'multer';

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

	@Post(':userId/avatar')
	async uploadFile(@Request() req: any) {
		const s3 = new S3({
			region: 'us-east-1',
		});

		const res = await s3
			.upload({
				Bucket: 'newpet-dev-images',
				Key: 'avatar.jpg',
				ContentType: 'image/jpeg',
				Body: req.body.file,
			})
			.promise();

		return {
			message: 'File uploaded successfully',
			data: { ...res },
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
