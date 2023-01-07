import { DatabaseConfig } from '@libs/database';

export interface SharedConfigService {
	databaseDefault: DatabaseConfig;
}
