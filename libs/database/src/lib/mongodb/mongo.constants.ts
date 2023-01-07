/**
 * Constant to be used to inject the CAF MongDB connection and/or Db.
 * @example
 *
 * ```ts
 *  constructor(
 *    ＠InjectDb(CAF_MONGO_CONNECTION)
 *    private readonly cafMongoDb: Db,
 *    ＠InjectClient(CAF_MONGO_CONNECTION)
 *    private readonly cafMongoClient: MongoClient,
 *  ) {}
 * ```
 */
export const CAF_MONGO_CONNECTION = 'CAF_MONGO_CONNECTION';

/**
 * Constant to be used to inject the TRUST MongDB connection and/or Db.
 *
 * @example
 * ```ts
 *  constructor(
 *    ＠InjectDb(TRUST_MONGO_CONNECTION)
 *    private readonly trustMongoDb: Db,
 *    ＠InjectClient(TRUST_MONGO_CONNECTION)
 *    private readonly trustMongoClient: MongoClient,
 *  ) {}
 * ```
 */
export const TRUST_MONGO_CONNECTION = 'TRUST_MONGO_CONNECTION';
