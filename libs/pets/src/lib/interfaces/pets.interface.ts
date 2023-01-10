import { ObjectId } from 'mongodb';

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

	type: 'dog' | 'cat';

	breed: string;

	birthDate: string;

	ownerId: string;

	// populated from ownerId
	owner?: Owner;

	createdAt: Date;

	updatedAt: Date;
}
