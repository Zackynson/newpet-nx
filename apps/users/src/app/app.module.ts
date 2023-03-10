import { Module } from '@nestjs/common';

import { AuthModule } from '@libs/auth';
import { UsersModule } from '@libs/users';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [UsersModule, AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
