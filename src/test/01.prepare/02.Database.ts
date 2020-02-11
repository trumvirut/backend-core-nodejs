import 'mocha';
import { Connection } from 'typeorm';
import { InternalServerError } from 'routing-controllers';
import DataAccess from '../../application/dataAccess';

let connection: Connection;

before(async function() {
    this.timeout(10000);
    if (process.env.NODE_ENV !== 'test') throw new InternalServerError('NODE_ENV is invalid!');

    connection = await DataAccess.createDBConnection();
    if (connection.queryResultCache)
        await connection.queryResultCache.clear();

    await connection.dropDatabase();
    await connection.runMigrations();
});

after(async () => {
    await connection.dropDatabase();
    await connection.close();
});
