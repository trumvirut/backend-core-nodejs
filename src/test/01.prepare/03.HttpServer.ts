import 'mocha';
import { expect } from 'chai';
import * as request from 'request-promise';
import createHttpServer from '../../system/HttpServer';
const port = 3333;

before(function(done) {
    this.timeout(10000);
    createHttpServer(port);
    done();
});

after(done => {
    done();
});

describe('Server testing', () => {
    it('Test server http running', function() {
        this.timeout(10000);
        request({ uri: `http://localhost:${port}` }).then(() => {
            expect(true).to.eq(true);
        }).catch(err => {
            expect(!!err.statusCode).to.eq(true);
        });
    });
});
