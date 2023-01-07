import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseDefaultModule } from '@shared/mongoose';
import { User, UserSchema } from './schemas';
import { UsersService } from './services/users.service';

@Module({
	imports: [MongooseDefaultModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	controllers: [],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
