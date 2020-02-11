import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as typedi from 'typedi';
import * as typeorm from 'typeorm';
import * as routing from 'routing-controllers';
import * as socketController from 'socket-controllers';
import * as validator from 'class-validator';

dotenv.config();
typeorm.useContainer(typedi.Container);
routing.useContainer(typedi.Container);
socketController.useContainer(typedi.Container);
validator.useContainer(typedi.Container);
