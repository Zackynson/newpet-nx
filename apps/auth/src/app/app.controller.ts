import { AuthService } from '@libs/auth';
import { UserInterface } from '@libs/users';
import { Controller, Get, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AppController {
	constructor(@Inject(AuthService) private readonly authService: AuthService) {}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req: ExpressRequest) {
		const token = await this.authService.login(req.user as UserInterface);

		return {
			token,
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('me')
	async me(@Request() req: any) {
		const userId = req.user?.id;

		return this.authService.getUserById(userId);
	}
}
