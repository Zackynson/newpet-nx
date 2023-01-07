import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';

import { InjectConnection as MongooseInjectConnection } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../schemas/users.schema';

@Injectable()
export class UsersService {
	constructor(@MongooseInjectConnection() private readonly mongooseConn: Connection) {
		this.mongooseConn.set('debug', true);
	}

	/**
	 * Returns a Model with the db instance set to dbName or
	 * the db provided by the connection uri.
	 * @param dbName Db name to have the Connection pointing to
	 * @returns Model<UserDocument> Model using the defined db
	 */
	userModel(dbName = 'newpet') {
		return (
			this.mongooseConn
				// Creates a cached connection to dbName. All calls to `connection.useDb(dbName, { useCache: true })` will return the same
				// connection instance as opposed to creating a new connection instance
				.useDb(dbName, { useCache: true })
				.model(User.name, UserSchema) as Model<UserDocument>
		);
	}

	/**
	 * Creates a TransactionDocument but does not persist it.
	 *
	 * @param params.transaction transaction object to populate the document
	 * @param params.dbName Db name to have the Connection pointing to
	 */
	async create(params: { user?: Partial<User>; dbName?: string } = {}): Promise<string> {
		const model = this.userModel(params.dbName);
		const userModel = await new model(params.user).save();

		return userModel._id.toString();
	}

	async findById(userId: string): Promise<UserDocument> {
		console.log('Find user on mongodb by id attempt: ', userId);

		const user = await this.userModel().findById(userId);
		if (!user) throw new NotFoundException('User not found');

		console.log('Find user on mongodb by id success', user);

		return user;
	}

	async list(): Promise<UserDocument[]> {
		console.log('List users on mongodb attempt');
		const users = await this.userModel().find();
		console.log('List users on mongodb success', users);

		return users;
	}
}
