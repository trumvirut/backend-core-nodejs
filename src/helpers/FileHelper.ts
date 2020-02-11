import * as path from 'path';
import * as fs from 'fs';
import { CommonError } from '../application/models/common/Error';

export default class FileHelper {
    static getDirectories(sourcePath: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(sourcePath, (err, list) => {
                if (err)
                    reject(err);
                else
                    resolve(list.filter(item => fs.statSync(path.join(sourcePath, item)).isDirectory()));
            });
        });
    }

    static getFiles(sourcePath: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(sourcePath, (err, list) => {
                if (err)
                    reject(err);
                else
                    resolve(list.filter(item => !fs.statSync(path.join(sourcePath, item)).isDirectory()));
            });
        });
    }

    static createDirectory(dir) {
        const splitPath = dir.split('/');
        if (splitPath.length > 20)
            throw new CommonError(102, 'path');

        splitPath.reduce((path, subPath) => {
            let currentPath;
            if (subPath !== '.') {
                currentPath = path + '/' + subPath;
                if (!fs.existsSync(currentPath))
                    fs.mkdirSync(currentPath);
            }
            else
                currentPath = subPath;

            return currentPath;
        }, '');
    }

    static readFile(filePath: string, encoding?: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            if (!filePath || !filePath.trim())
                return reject(new CommonError(101, 'path'));

            fs.readFile(filePath, { encoding }, (error, data) => {
                if (error)
                    return reject(error);
                resolve(data as Buffer);
            });
        });
    }

    static writeFile(filePath: string, data: Buffer | Uint8Array, encoding?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!filePath || !filePath.trim())
                return reject(new CommonError(101, 'path'));
            if (!data)
                return reject(new CommonError(101, 'data'));

            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir))
                FileHelper.createDirectory(dir);

            if (dir === filePath.trim())
                return reject(new CommonError(102, 'path'));

            fs.writeFile(filePath, data, { encoding }, error => {
                if (error)
                    return reject(error);
                resolve();
            });
        });
    }
}
