import { CreatePetDTO, UpdatePetDTO } from '@libs/pets';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	Request,
	UseGuards,
} from '@nestjs/common';
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
	@Put(':petId')
	async update(
		@Body() updatePetDto: UpdatePetDTO,
		@Request() req: any,
		@Param('petId') petId: string
	): Promise<ControllerResponse> {
		const ownerId = req.user.id;

		await this.appService.updatePet(updatePetDto, petId, ownerId);

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

	@UseGuards(AuthGuard('jwt'))
	@Delete(':petId/image')
	async deleteFile(@Request() req: any, @Param('petId') petId: string, @Query('imageUrl') imageUrl: string) {
		if (!petId) throw new BadRequestException('petId is required');
		if (!imageUrl) throw new BadRequestException('imageUrl is required');

		const ownerId = req.user.id;
		await this.appService.deleteImage(imageUrl, petId, ownerId);

		return {
			message: 'Image successfully deleted',
		};
	}
}
