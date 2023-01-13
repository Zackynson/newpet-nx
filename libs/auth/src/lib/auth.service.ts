import { User, UsersService } from '@libs/users';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { ObjectId } from 'mongodb';

interface TokenPayload {
	_id: string | ObjectId;
}

@Injectable()
export class AuthService {
	constructor(
		@Inject(UsersService) private readonly userService: UsersService,
		@Inject(JwtService) private readonly jwtService: JwtService
	) {}

	async getUserById(userId: string): Promise<User> {
		return (await this.userService.findById(userId)) as User;
	}

	async login(user: TokenPayload): Promise<string> {
		const payload = {
			sub: user._id,
		};

		return this.jwtService.sign(payload);
	}

	async validateUser(email: string, password: string) {
		const user = await this.userService.findByEmail(email);

		if (!user?.email || !user.password) {
			console.log('User not found');
			throw new UnauthorizedException('Invalid email or password');
		}

		const isValid = await compare(password, user.password);

		if (!isValid) {
			console.log('User found but password does not match');
			throw new UnauthorizedException('Invalid email or password');
		}

		return user;
	}
}
