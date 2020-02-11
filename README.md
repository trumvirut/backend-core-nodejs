# Backend Seed 2
NodeJS - Typescript - TypeORM - PostgreSQL

* Integrating user permission & good transmission in large numbers of users.
* Cache data to improve performance. Can store into database or Redis.
* Realtime with Socket IO.
* Build fast and easy to expand environment with docker.
* Suitable for Web apps & APIs.
* Run & debug on .ts files by Visual Code.
* Unit test & coverage.
* Generate module.
* Database migration.

### Patterns and Principles

- Multi-layer Architecture Pattern
- Data Mapper Pattern
- Singleton Pattern
- API Response

### Tools

- NodeJS
- Typescript
- ExpressJS
- TypeORM
- PostgreSQL
- Redis
- ESLint
- Mocha
- Nyc
- Grunt
- Docker
- Docker Compose
- Visual Code

### Required

- Docker (version >= 18.x) & Docker Compose (version >= 1.23.2)
- NodeJS (version >= 7.x)
- Knowledge of Typescript, ES6, TypeORM, PostgreSQL.

### Document Related

- [Typescript](https://github.com/Microsoft/TypeScript#documentation)
- [ES6 - ECMAScript 2015](http://es6-features.org)
- [JavaScript Standard Style](https://standardjs.com/rules.html)
- [TypeORM](https://github.com/typeorm/typeorm) & [Migrations](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md#migrations)
- [Routing controllers](https://github.com/typestack/routing-controllers#routing-controllers)
- [Socket controllers](https://github.com/typestack/socket-controllers#socket-controllers)
- [Socket IO](https://socket.io/docs/) & [Emit cheatsheet](https://socket.io/docs/emit-cheatsheet/)

### Source Structure

```sh
- |-- .nyc_output
- |-- .vscode -----------------------------// Visual code configuration.
- |-- coverage ----------------------------// Data report for testing coverage.
- |-- dist --------------------------------// Built from the src directory.
- |-- node_modules
- |-- src ---------------------------------// Source of development.
- |------ application
- |------------ businesses ----------------// Logical code & business flow.
- |------------ dataAccess ----------------// Create database connection.
- |------------ entities ------------------// Entity is a class that maps to a database table (or collection when using MongoDB).
- |------------ migrations ----------------// Synchronize model changes into the database.
- |------------ models --------------------// Model mapping for input & output data.
- |------ controllers ---------------------// Navigate for requests.
- |------ helpers
- |------ middlewares
- |------------ BodyParserMiddleware.ts ---// Body parser.
- |------------ ErrorMiddleware.ts --------// Handling of errors.
- |------------ LoggingMiddleware.ts ------// Logs, track requests.
- |------ resources
- |------------ data ----------------------// Static data common.
- |------------------ MessageError.ts -----// Message of errors.
- |------------------ initialization ------// Initialize data default or test.
- |------------ documents -----------------// Document files for initial data or example.
- |------------ images --------------------// Image files for initial data or example.
- |------------ permissions ---------------// Claims - Static data that use to compare/check permission.
- |------------ templates
- |------------------ mail ----------------// Mail templates.
- |------------------ source --------------// Source templates for generate module.
- |------ socket-controllers --------------// Navigate for socket io.
- |------ system
- |------------ Authenticator.ts ----------// Handle authentication.
- |------------ CustomDecorator.ts --------// Custom decorator.
- |------------ HttpServer.ts -------------// Initialize http server.
- |------------ Singleton.ts --------------// Define singleton and need to load first.
- |------------ SocketServer.ts -----------// Initialize socket server.
- |------ test ----------------------------// Source testing.
- |------ app.ts --------------------------// Main application.
- |-- uploads -----------------------------// Upload directory.
- |-- .env --------------------------------// Main configuration created by `.env.sample`.
- |-- .env.sample -------------------------// Environment configuration sample.
- |-- .eslintrc.js ------------------------// Eslint configuration.
- |-- .gitignore --------------------------// Git ignore configuration.
- |-- .nycrc ------------------------------// Nyc configuration for testing coverage.
- |-- docker-compose.yml ------------------// Docker configuration.
- |-- gruntfile.js
- |-- LICENSE
- |-- ormconfig.js ------------------------// TypeORM configuration.
- |-- package-lock.json -------------------// Lock package version.
- |-- package.json
- |-- README.md ---------------------------// `IMPORTANT` to start the project.
- |-- tsconfig.json -----------------------// Typescript configuration.
```

### NPM Commands

```s
npm run cache:clear -------------------------------// Clear cache of TypeORM.
npm run migration:generate -- -n Migration_Name ---// Generate migration for update database structure.
npm run migration:run -----------------------------// Run the next migrations for update database structure.
npm run migration:revert --------------------------// Revert migration for update database structure.
npm run generate:module -- ModuleName -------------// Generate module: entity, model, business, controller,...
npm run lint
npm test ------------------------------------------// Start unit test.
npm run build -------------------------------------// Build source before start with staging or production environment.
npm run dev ---------------------------------------// Start with development environment.
npm start -----------------------------------------// Start with staging or production environment.
```

### Grunt Commands

```s
./node_modules/.bin/grunt clean ---------------------------// Remove "dist" folder.
./node_modules/.bin/grunt sync ----------------------------// Copy all resource files to dist without extension ".ts".
```

### Debug on Visual Code

* Press F5: build & start with debug mode.
* Debugging in .ts files.


## Quick Start

> Please make sure PostgreSQL & Redis services is running. You can use [docker PostgreSQL](https://github.com/felixle236/docker-postgresql) & [docker Redis](https://github.com/felixle236/docker-redis).

Clone `.env.sample` to `.env` in the same directory and update configuration for project.
Install the npm package:

```
npm install
```

Run the migration for update database structure (need to create database before):

```
npm run migration:run
```

Run the below command for start with development environment:

```
npm run dev
```

Also you can run test command and enjoy (need to create database test before):

```
npm test
```

### Deploy for staging and production

- We must modify environment variables into `.env`.
- And run `docker system prune -f && docker-compose build && docker-compose up -d`.

> Please make sure you have installed Docker and Docker Compose. You can refer to docker compose document in [here](https://docs.docker.com/compose/overview/#compose-documentation).

### Setup auto deployment

- You should setup the testing step for make sure anything is good. Example:
```
npm install && npm run build
```

- Setup the deployment step like this:
```
- apk add --update openssh # Use this command for Alpine Linux
- ssh $STAG_USER@$STAG_ADDR "cd $STAG_PROJECT_PATH && git pull && docker system prune -f && docker-compose build && docker-compose up -d && docker-compose exec -T web-app npm -- run migration:run && exit;"
```

### Generate Module

- This feature is very useful. It helps developers to reduce a part of development time.
- If you want to create module Customer, you can execute: `npm run generate:module -- Customer`. It will generate entity, model, business, business interface, controller, initialization resource, permission resource, unit test.

### Configuration

- `.env` file is main configuration created by `.env.sample`. Should read more for understand all.
- `.dockerignore` is Docker ignore configuration.
- `docker-compose.yml` is Docker configuration.
- `Dockerfile` is Docker script for build image.
- `.eslintrc.js` is Eslint configuration.
- `.gitignore` is Git ignore configuration.
- `.nycrc` is Nyc configuration for testing coverage.
- `ormconfig.js` is TypeORM configuration.
- `tsconfig.json` is Typescript configuration.

### Data Storage

- PostgreSQL is database that used in this project.
- Redis is memory database that we use to increase performance.
- `uploads/` directory contains the files can be uploaded.
- We can use [Minio](https://github.com/felixle236/docker-minio) like AWS S3 to store the file go to cloud.

### Data Caching

- Default this project is using Redis for data caching. It helps greatly increase the number of large requests to less changing data.
> But don't forget to set expire time and clear cache if have any update on the data related. Refer to [TypeORM Caching](https://github.com/typeorm/typeorm/blob/master/docs/caching.md).
- Currently we are caching the user authenticated in few minutes and permission list in day. You can refer to function `getUserByToken` of `UserBusiness` and `checkPermission` of `PermissionBusiness`.
- To clear cache, execute command `await connection.queryResultCache.remove(['permissions']);` or use typeorm `typeorm cache:clear` or use npm `npm run cache:clear`.


## Workflow

### Branch prefixes

- bugfix/
- feature/
- hotfix/
- release/

> Exp: feature/feature-name

### Gitflow workflow

<div align="center">
    <img src="https://wac-cdn.atlassian.com/dam/jcr:61ccc620-5249-4338-be66-94d563f2843c/05%20(2).svg?cdnVersion=411" height="400" />
</div>

### CICD pipeline deployment

![CICD pipeline deployment](https://cdn-images-1.medium.com/max/2600/1*1kUhczYDfpkWXSFt0mI2dA.png)


## General Working Rules

### API Response Format

- Return error object [UnauthorizedError] with status code 401, this is handler of routing-controllers package.
```
Request:
curl -i -H Accept:application/json -X GET http://localhost:3000/api/users/profile

Response:
HTTP/1.1 401 Unauthorized
{
   "httpCode": 401,
   "name": "UnauthorizedError"
}
```

- Return error object [CommonError] with status code 400, this is logic handler.
```
Request:
curl -i -H Accept:application/json -X POST http://localhost:3000/api/users/signin -H Content-Type:application/json -d '{"email": "admin@localhost.com","password": "Backend-seed"}'

Response:
HTTP/1.1 400 Bad Request
{
   "httpCode": 400,
   "message": "The email address or password is incorrect!"
}
```

- Return data object [T] with status code 200.
```
Request:
curl -i -H Accept:application/json -X POST http://localhost:3000/api/users/signin -H Content-Type:application/json -d '{"email": "admin@localhost.com", "password": "Backend-seed2"}'

Response:
HTTP/1.1 200 OK
{
   "id": 1,
   "role": {
      "id": 1,
      "code": 1,
      "name": "Administrator"
   },
   "profile": {
      "firstName": "Admin",
      "lastName": "Local",
      "email": "admin@localhost.com",
      "avatar": null,
      "gender": 1,
      "birthday": null,
      "phone": null,
      "address": null,
      "culture": null,
      "currency": null
   },
   "accessToken": "5a30e2511e0d26b7c594bc0bdee5cfc093599102697809a5e77505b887ed41e7",
   "tokenExpire": "2019-01-15T07:10:30.042Z"
}
```

- Return data object [ResultList\<T\>] with status code 200.
```
Request:
curl -i -H Accept:application/json -H Authorization:5a30e2511e0d26b7c594bc0bdee5cfc093599102697809a5e77505b887ed41e7 -X GET http://localhost:3000/api/roles

Response:
HTTP/1.1 200 OK
{
   "pagination": {
      "skip": 0,
      "limit": 10,
      "total": 2
   },
   "results": [
      {
         "id": 1,
         "code": 1,
         "name": "Administrator",
         "level": 1,
         "createdAt": "2018-12-31T04:28:58.626Z",
         "updatedAt": "2018-12-31T04:28:58.626Z"
      },
      {
         "id": 2,
         "code": 2,
         "name": "User Common",
         "level": 2,
         "createdAt": "2018-12-31T04:28:58.669Z",
         "updatedAt": "2018-12-31T04:28:58.669Z"
      }
   ]
}
```

- Return boolean data with status code 200. If you request to count api, you will get a number.
```
Request:
curl -i -H Accept:application/json -X POST http://localhost:3000/api/systems/init-roles -H Content-Type:application/json

Response:
HTTP/1.1 200 OK
true
```

### Naming Rules For API

- With get or find function, we use `GET` method:

```
http://localhost/api/users
http://localhost/api/users?keyword=felix
http://localhost/api/users/1 ---> Get user with id is 1.
http://localhost/api/users/profile ---> Get your profile.
```

- With create function or request must hidden data or upload files, we use `POST` method:

```
http://localhost/api/users/signin
http://localhost/api/users
http://localhost/api/users/signup
http://localhost/api/users/avatar
```

- With update function, we use `PUT` method:

```
http://localhost/api/users/1
http://localhost/api/users/profile ---> Update your profile.
```

- With update function and only 1 field, we use `PATCH` method:

```
http://localhost/api/users/password
```

- With delete function, we use `DELETE` method:

```
http://localhost/api/users/1
```

### Error Handler

We should define message error into `src/resources/data/MessageError.ts`. Exp:
```
static ERR_001 = 'Data is invalid!';
static ERR_002 = 'Access is denied!';
static ERR_003 = 'The data cannot save!';

static ERR_101 = 'The {0} is required!';
static ERR_102 = 'The {0} is invalid!';
static ERR_103 = 'The {0} is incorrect!';
static ERR_104 = 'The {0} is not exists!';
static ERR_105 = 'The {0} is already existed!';

static ERR_201 = 'The {0} must be at least {1} characters!';
static ERR_202 = 'The {0} must be a maximum of {1} characters!';
static ERR_203 = 'The {0} must be less than or equal to {1}!';
static ERR_204 = 'The {0} must be greater than or equal to {1}!';
static ERR_205 = 'Invalid or unsupported {0} format! The following formats are supported: {1}';

static ERR_301 = 'The {0} must be at least {1} and maximum {2} characters!';
static ERR_302 = 'The {0} must be at least {1} characters {2}!';
static ERR_303 = 'The {0} must be between {1} and {2}!';
static ERR_304 = 'The {0} must be a maximum of {1} {2}!';
```

Usage:
```
import {CommonError} from '../application/models/common/Error';
....
throw new CommonError(); // Using default ERR_001 => Data is invalid!
throw new CommonError(2); // ERR_002 => Access is denied!
throw new CommonError(101, 'id'); // ERR_101 => The id is invalid!
throw new CommonError(205, 'image', 'JPEG (.jpeg/.jpg), GIF (.gif), PNG (.png)'); // ERR_205 => Invalid or unsupported image format! The following formats are supported: JPEG (.jpeg/.jpg), GIF (.gif), PNG (.png)
throw new CommonError(301, 'password', 6, 20); // ERR_301 => The password must be at least 6 and maximum 20 characters!
```

> If you got error with status code 500, it's error system. Almost, this is your source code, you need find and fix it soon.

### Common Type

- Define enum type into `src\application\models\common\CommonType.ts`.
- When do we use enum type in our project?
   > Define a serial of data in a column in the database that we can identify earlier. Exp: RoleCode, OrderStatus, InvoiceStatus, AccountType,....
- Why do we use enum type that it's not a value?
   > It will be easier to understand and maintain your source code. Please take a look and compare them: `if (order.status === OrderStatus.Draft)` vs `if (order.status === 1)`, `order.status = OrderStatus.processing` vs `order.status = 2`.
- The advice is that you should use a starting value of `1` if you are using the number data type. It will be easier to validate the data input. Exp: `if (!data.status) throw new CommonError(101, 'order status');`
- If you use column numeric type in PostgreSQL, it will be a string (not number), you should use transformer option. Exp: `@Column('numeric', { transformer: new ColumnNumericTransformer() })`

### Design & Structure Modules, Entities, Models, Controllers

- The module will have one business, all functions related to this business.
- The module will have one or many business interfaces, one or many entities, models and controllers are the same.
- Look at Permission module, we have 2 object Role and Permission with 2 business interfaces, 2 entities, 2 controllers.
- The model will have models view, lookup, reference, create, update,....maybe we just need a few of them. The purpose is filter the number of fields and modify them before returning the user.
   - The view model usually map almost all entity fields, use to show/manage the data detail or list.
   - The lookup model map a few of entity fields, use to show the data in dropdown list.
   - The reference model map a few of entity fields into the view model, we should seperate this model with lookup model.
   - The create/update model will map and validate the data input to create/update data in database, we are using `class-validator` to validate data.

### Business Interface

- An interface only contains declarations of method, events & properties.
- An interface cannot include private members. All the members are public by default.
- A class that implements an interface can explicitly implement members of that interface. An explicitly implemented member cannot be accessed through a class instance, but only through an instance of the interface. Exp:
```
# New instance
const roleBusiness: IRoleBusiness = new RoleBusiness();

# Singleton with service container
const roleBusiness: IRoleBusiness = Container.get(RoleBusiness);

# Singleton with injects a service
@Inject(() => RoleBusiness)
private roleBusiness: IRoleBusiness;
```

### Database Execution

- Default TypeORM is using connection pool, it will auto connect and release connection when we execute database query except manual connect with QueryRunner, we must execute connect and release commands.
- We should use QueryBuilder for database execution, it will select and map to entity object, it will easier after that.
- To use database transaction, please use `executeTransaction` function into `dataAccess`. It's built for general use about db transaction and we can use transaction for many businesses into one process, it's very easy to commit and rollback for all.

### Database Migration

- A database is a vital part of every complex application. Databases change very often and contain data that can even disintegrate our whole application if they get out of sync. Changing a live database, whether it's related to schema or data, can be hard. Modern apps, where Agile methodologies along with processes such as Continuous Integration apply, have raised the bar of complexity so maintaining a database separately from the application's business logic can be quite painful.
- Many projects, however, are still better suited to using a relational database such as MySQL or Postgres. Unlike the NoSQL counterpart, relational database schema changes need to be managed on the database server, which is separate from the code.

> Fortunately, we have Database Migrations, a technique to help us keep our database changes under control. Database migration is the process of transforming data between various states without any human interaction. This process will allow us to track changes between schema updates.

- In a production environment, where data is already in the DB, we may have to migrate those as well. Same cases apply to testing and staging environments but production is a more fragile universe where mistakes are not forgiven. Say we need to split the Name field of our Users table into a First/Last Name fields combination. One approach would be to create a field called Last Name. Traverse the table, split the Name into two chunks and move the latter to the newly created field. Finally, rename the Name field into First Name. This is a case of data migrations.

- To generate new migration:
```
npm run migration:generate -- -n Migration_Name
```
> Migration_Name should be named full meaning. Exp: Create_Table_Customer, Add_Field_Email_In_Customer, Modify_Field_Email_In_Customer,....

- To run the next migrations for update database structure:
```
npm run migration:run
```

- To revert back the previous migration:
```
npm run migration:revert
```

### Permission

- We are using the claim for permission to check, we shouldn't use the role, the role is just the master data, think about an extended case later.
- The claim is defined in `./src/resources/permissions`, each claims number will unique with all other claims.
- We just validate and check permission in controllers and pass user id (user authenticated) into business functions (if necessary). It will easier for management and unit test.
- Usually, we have 3 cases:
   - `Anonymous` (Non-user) to allow access API, we don't need to do anything about permission.
   - `User` to allow access API, just use `@Authorized()` without claim on controller functions.
   - `Manager/Admin` to allow access API, just use `@Authorized(UserClaim.UPDATE)` with claim on controller functions.
- `@Authorized()` is a decorator, it will check `authorization` header and authenticate user, if authenticate success then return UserView object. Also, we can pass the claim in this function for check. The process will be through the cache first, so the process will be handled very quickly. Take a look in `./src/system/Authenticator.ts`.

### Experiences

- API controllers order should be arranged in turn according to GET, POST, PUT, PATCH, DELETE.
- Business function A is not allowed to use repository B, we must use business to business. It will ensure consistency of data and processing.
