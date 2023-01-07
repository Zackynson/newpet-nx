import { Module } from '@nestjs/common';

import { UsersModule } from '@libs/users';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [UsersModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
