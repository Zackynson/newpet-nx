import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as FileType from 'file-type';
import { Connection, Model } from 'mongoose';

import { InjectConnection as MongooseInjectConnection } from '@nestjs/mongoose';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { User as UserInterface } from '../interfaces/user.interface';
import { User, UserDocument, UserSchema } from '../schemas/users.schema';

const s3 = new S3({
	region: 'us-east-1',
});
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
	 * Creates a UserDocument and persist it.
	 *
	 * @param params.user user object to populate the document
	 * @param params.dbName Db name to have the Connection pointing to
	 */
	async create(params: { user?: Partial<UserInterface>; dbName?: string } = {}): Promise<string> {
		const model = this.userModel(params.dbName);
		const userModel = await new model(params.user).save();

		return userModel._id.toString();
	}

	async uploadFile(base64FileString: string, userId: string, fileName: string): Promise<string> {
		const binaryData = Buffer.from(base64FileString, 'base64');

		const fileInfo = await FileType.fromBuffer(binaryData);

		if (!fileInfo) throw new InternalServerErrorException('Could not retrieve file information');

		const { ext = 'jpg', mime = 'image/jpeg' } = fileInfo;
		const key = `${userId}/${fileName}.` + ext;

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

	async updateAvatar(base64FileString: string, userId: string): Promise<void> {
		const user = await this.userModel().findById(userId);
		if (!user) throw new NotFoundException('User not found');

		const uploadedImageUrl = await this.uploadFile(base64FileString, userId, 'avatar');

		await user.update({
			$set: { avatar: uploadedImageUrl },
		});
	}

	async updateUser(data: UpdateUserDTO, userId: string) {
		const user = await this.userModel().findById(userId);
		if (!user) throw new NotFoundException('User not found');

		await user.update({
			$set: { ...data },
		});
	}

	async findById(userId: string, includePassword = false): Promise<UserInterface> {
		console.log('Find user on mongodb by id attempt: ', userId);

		const user = await this.userModel().findById<UserInterface>(userId);
		if (!user) throw new NotFoundException('User not found');

		console.log('Find user on mongodb by id success', user);

		if (!includePassword) delete user.password;
		return user;
	}

	async list(): Promise<Omit<UserInterface, 'password'>[]> {
		console.log('List users on mongodb attempt');
		const users = await this.userModel()
			.find<UserInterface>(
				{},
				{
					_id: 1,
					name: 1,
					email: 1,
					avatar: 1,
					createdAt: 1,
					updatedAt: 1,
				},
				{
					skip: 0,
					limit: 10,
				}
			)
			.exec();

		console.log('List users on mongodb success', users);

		return users;
	}
}
