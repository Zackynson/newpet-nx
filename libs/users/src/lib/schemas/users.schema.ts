import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

/**
 * User schema class
 */
@Schema({
	collection: 'users',
	timestamps: true,
})
export class User {
	@Prop()
	name: string;

	@Prop()
	email: string;

	@Prop()
	password: string;

	@Prop()
	avatar: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}

export type UserDocument = mongoose.HydratedDocument<User>;
export type UserLeanDocument = mongoose.LeanType<UserDocument>;

export const UserSchema = SchemaFactory.createForClass(User);
