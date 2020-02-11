const path = require('path');
const sourceDir = process.env.NODE_ENV === 'development' ? 'src' : 'dist';

module.exports = {
    name: 'default',
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME + (process.env.NODE_ENV === 'test' ? '_test' : ''),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    cache: {
        type: 'redis',
        options: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        }
    },
    synchronize: false,
    logging: JSON.parse(process.env.DB_LOGGING),
    entities: [
        path.join(__dirname, './' + sourceDir + '/application/entities/*{.js,.ts}')
    ],
    migrations: [
        path.join(__dirname, './' + sourceDir + '/application/migrations/*{.js,.ts}')
    ],
    cli: {
        migrationsDir: './' + sourceDir + '/application/migrations'
    }
};
