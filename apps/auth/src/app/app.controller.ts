import { AuthService } from '@libs/auth';
import { UserInterface } from '@libs/users';
import { Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AppController {
	constructor(@Inject(AuthService) private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(AuthGuard('local'))
	async login(@Request() request: ExpressRequest) {
		const token = await this.authService.login(request.user as UserInterface);

		return {
			token,
		};
	}
}
