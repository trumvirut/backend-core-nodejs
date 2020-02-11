import * as fs from 'fs';

export default class LogHelper {
    static writeLog(message: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.appendFile('./logs.txt', `${(new Date()).toLocaleString()} : ${message}\n`, 'utf8', err => {
                if (err)
                    console.log('\x1b[31m', err, '\x1b[0m');
                resolve();
            });
        });
    }
}
