import { Connection, QueryRunner, createConnection } from 'typeorm';

export default class DataAccess {
    private static _connection: Connection;

    static get connection(): Connection {
        return DataAccess._connection;
    }

    /**
     * Creates a new connection and registers it in the manager.
     * Only one connection from ormconfig will be created (name "default" or connection without name).
     */
    static async createDBConnection(): Promise<Connection> {
        DataAccess._connection = await createConnection();
        return DataAccess._connection;
    }

    /**
     * Removes all cached results by given identifiers from cache.
     */
    static async removeCaching(key: string): Promise<void> {
        if (key && DataAccess._connection.queryResultCache)
            await DataAccess._connection.queryResultCache.remove([key]);
    }

    /**
     * Execute database transaction.
     * Can be execute database transaction throght multiple businesses.
     * @param exec The function executes the database query commands with transaction mode.
     * @param queryRunner If it's undefined, it will be defined inside the function. It can be used for multiple businesses.
     * @param failCallback The function can called after roll back transaction.
     */
    static async executeTransaction<T>(exec: (queryRunner: QueryRunner)=> T, queryRunner?: QueryRunner, failCallback?: any): Promise<T> {
        let result: T;

        if (queryRunner)
            result = await exec(queryRunner);
        else {
            queryRunner = DataAccess.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                result = await exec(queryRunner);

                await queryRunner.commitTransaction();
                await queryRunner.release();
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();

                if (failCallback instanceof Function)
                    failCallback();
                else if (failCallback instanceof Promise)
                    await Promise.resolve(failCallback);

                throw error;
            }
        }
        return result;
    }
};
