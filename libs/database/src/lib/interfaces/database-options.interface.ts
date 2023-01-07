import { DatabaseType } from '../enums/database-type.enum';

/**
 * Defines the basic information all Database options might have.
 */
export interface DatabaseOptions {
	/**
	 * The type is the most basic infomation that we need since we might
	 * have multiple databases handled by this module, therefore it would
	 * help us to define what type on properties we might expect from the
	 * target object.
	 */
	type: DatabaseType;
}
