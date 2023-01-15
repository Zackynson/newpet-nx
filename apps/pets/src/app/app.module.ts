import { AuthModule } from '@libs/auth';
import { PetsModule } from '@libs/pets';
import { UsersModule } from '@libs/users';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [PetsModule, UsersModule, AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
