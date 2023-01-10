import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection as MongooseInjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Pet as PetInterface } from './interfaces/pets.interface';
import { Pet, PetDocument, PetSchema } from './schemas';

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
}
