import { ObjectId } from 'mongodb';
import { PetSize } from '../enums/pet-size.enum';
import { PetType } from '../enums/pet-type.enum';

export class Owner {
	_id: string;
	name: string;
}

/**
 * Pets interface
 */
export class Pet {
	_id: string | ObjectId;

	name: string;

	type: PetType;

	breed: string;

	address: string;

	images: string[];

	birthDate: string;

	ownerId: string;

	size: PetSize;

	// populated from ownerId
	owner?: Owner;

	createdAt: Date;

	updatedAt: Date;
}
