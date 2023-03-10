import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Owner } from '../interfaces';

/**
 * Pets schema class
 */
@Schema({
	collection: 'pets',
	timestamps: true,
})
export class Pet {
	@Prop()
	name: string;

	@Prop()
	ownerId: string;

	@Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
	owner: Owner;

	@Prop()
	type: string;

	@Prop()
	images: string[];

	@Prop()
	breed: string;

	@Prop()
	address: string;

	@Prop()
	size: string;

	@Prop()
	gender: string;

	@Prop()
	age: string;

	@Prop()
	createdAt: Date;

	@Prop()
	updatedAt: Date;
}

export type PetDocument = mongoose.HydratedDocument<Pet>;
export type PetLeanDocument = mongoose.LeanType<PetDocument>;

export const PetSchema = SchemaFactory.createForClass(Pet);
