import { CreatePetDTO } from '@libs/pets';
import { BadRequestException, Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ControllerResponse } from '@shared/interfaces';
import { Request as ExpressRequest } from 'express';
import { AppService } from './app.service';

@UseGuards(AuthGuard('jwt'))
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

	@Get(':petId')
	async getPetById(@Param('petId') petId: string): Promise<ControllerResponse> {
		const pet = await this.appService.getPetById(petId);
		return {
			data: pet,
		};
	}

	@Post(':petId/image')
	async uploadFile(@Request() req: ExpressRequest, @Param('petId') petId: string) {
		if (!petId) throw new BadRequestException('petId is required');

		if (!req.body.file || typeof req.body.file !== 'string' || !req.body.file.length) {
			throw new BadRequestException('File must be a base64 encoded string');
		}

		const base64Data = req.body.file.replace(/^data:image\/png;base64,/, '');

		await this.appService.uploadImage(base64Data, petId);

		return {
			message: 'Image successfully uploaded',
		};
	}
}
