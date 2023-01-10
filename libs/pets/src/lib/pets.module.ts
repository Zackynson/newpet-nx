import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseDefaultModule } from '@shared/mongoose';
import { PetsService } from './pets.service';
import { Pet, PetSchema } from './schemas';

@Module({
	imports: [MongooseDefaultModule, MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }])],
	providers: [PetsService],
	exports: [PetsService],
})
export class PetsModule {}
