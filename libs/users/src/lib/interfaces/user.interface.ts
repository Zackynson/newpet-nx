import { ObjectId } from 'mongodb';

export class User {
	_id: string | ObjectId;

	name: string;

	email: string;

	password?: string;

	avatar?: string;

	phone?: string;

	createdAt?: Date;

	updatedAt?: Date;
}
