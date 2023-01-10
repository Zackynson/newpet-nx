import { CreatePetDTO } from '@libs/pets';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ControllerResponse } from '@shared/interfaces';

import { AppService } from './app.service';

@Controller('pets')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	async listPets(): Promise<ControllerResponse> {
		const list = await this.appService.listPets();

		return {
			data: list,
		};
	}

	@Post()
	async create(@Body() createPetDto: CreatePetDTO): Promise<ControllerResponse> {
		const petId = await this.appService.createPet(createPetDto);

		return {
			message: 'Pet successfully created',
			data: petId,
		};
	}
}
