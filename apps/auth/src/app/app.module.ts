import { AuthModule } from '@libs/auth';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
