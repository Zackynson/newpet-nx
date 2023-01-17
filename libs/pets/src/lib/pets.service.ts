import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection as MongooseInjectConnection } from '@nestjs/mongoose';
import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';
import * as FileType from 'file-type';
import { Connection, Model } from 'mongoose';
import { UpdatePetDTO } from './dtos/update-pet.dto';
import { Pet as PetInterface } from './interfaces/pets.interface';
import { Pet, PetDocument, PetSchema } from './schemas';

const s3 = new S3({
	region: 'us-east-1',
});

@Injectable()
export class PetsService {
	constructor(@MongooseInjectConnection() private readonly mongooseConn: Connection) {
		this.mongooseConn.set('debug', true);
	}

	/**
	 * Returns a Model with the db instance set to dbName or
	 * the db provided by the connection uri.
	 * @param dbName Db name to have the Connection pointing to
	 * @returns Model<PetDocument> Model using the defined db
	 */
	petModel(dbName = 'newpet') {
		return (
			this.mongooseConn
				// Creates a cached connection to dbName. All calls to `connection.useDb(dbName, { useCache: true })` will return the same
				// connection instance as opposed to creating a new connection instance
				.useDb(dbName, { useCache: true })
				.model(Pet.name, PetSchema) as Model<PetDocument>
		);
	}

	/**
	 * Creates a petDocument and persist it.
	 *
	 * @param params.pet pet object to populate the document
	 * @param params.dbName Db name to have the Connection pointing to
	 */
	async create(params: { pet: Partial<PetInterface>; dbName?: string }): Promise<string> {
		if (!params.pet.ownerId) throw new BadRequestException('Invalid pet owner');

		const model = this.petModel(params.dbName);
		const petModel = await new model(params.pet).save();

		return petModel._id.toString();
	}

	async list(dbName?: string): Promise<PetInterface[]> {
		const model = this.petModel(dbName);
		const pets = await model.find<PetInterface>().exec();
		return pets;
	}

	async uploadFile(base64FileString: string, userId: string, fileName: string): Promise<string> {
		const binaryData = Buffer.from(base64FileString, 'base64');

		const fileInfo = await FileType.fromBuffer(binaryData);

		const { ext = 'jpg', mime = 'image/jpeg' } = fileInfo || {};
		const key = `pets/${userId}/${fileName}.` + ext;

		const res = await s3
			.upload({
				Bucket: 'newpet-dev-images',
				Key: key,
				ContentType: mime,
				ContentEncoding: 'base64',
				Body: binaryData,
			})
			.promise();

		return res.Location;
	}

	async findById(petId: string): Promise<PetInterface> {
		const pet = await this.petModel().findById<PetInterface>(petId);
		if (!pet) throw new NotFoundException('Pet not found');

		return pet;
	}

	async updatePet(data: UpdatePetDTO, petId: string, ownerId: string): Promise<void> {
		const pet = await this.petModel().findById(petId);
		if (!pet) throw new NotFoundException('Pet not found');

		if (pet?.ownerId !== ownerId) {
			throw new BadRequestException('You cannot update this pet information');
		}

		await pet.update({
			$set: data,
		});
	}

	async uploadImage(base64FileString: string, petId: string, ownerId: string): Promise<void> {
		const pet = await this.petModel().findById(petId);
		if (!pet) throw new NotFoundException('Pet not found');

		if (pet?.ownerId !== ownerId) {
			throw new BadRequestException('You cannot upload images to this pet');
		}

		const uploadedImageUrl = await this.uploadFile(base64FileString, petId, randomUUID());

		await pet.update({
			$push: { images: uploadedImageUrl },
		});
	}
}
