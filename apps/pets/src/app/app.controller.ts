import { CreatePetDTO } from '@libs/pets';
import { BadRequestException, Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ControllerResponse } from '@shared/interfaces';
import { AppService } from './app.service';

@Controller('pets')
export class AppController {
	constructor(private readonly appService: AppService) {}

	@UseGuards(AuthGuard('jwt'))
	@Get()
	async listPets(): Promise<ControllerResponse> {
		const list = await this.appService.listPets();

		return {
			data: list,
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Post()
	async create(@Body() createPetDto: CreatePetDTO, @Request() req: any, @Query() query: any): Promise<ControllerResponse> {
		const ownerId = req.user.id;
		console.log(query);
		const petId = await this.appService.createPet(createPetDto, ownerId);

		return {
			message: 'Pet successfully created',
			data: petId,
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Get(':petId')
	async getPetById(@Param('petId') petId: string): Promise<ControllerResponse> {
		const pet = await this.appService.getPetById(petId);
		return {
			data: pet,
		};
	}

	@UseGuards(AuthGuard('jwt'))
	@Post(':petId/image')
	async uploadFile(@Request() req: any, @Param('petId') petId: string) {
		if (!petId) throw new BadRequestException('petId is required');

		if (!req.body.file || typeof req.body.file !== 'string' || !req.body.file.length) {
			throw new BadRequestException('File must be a base64 encoded string');
		}

		const base64Data = req.body.file.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

		const ownerId = req.user.id;
		await this.appService.uploadImage(base64Data, petId, ownerId);

		return {
			message: 'Image successfully uploaded',
		};
	}
}