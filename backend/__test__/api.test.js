const request = require('supertest');
describe('loading express', () => {
    let server;

    beforeEach(function () {
        server = require('../bin/www');
    });

    afterEach(function () {
        server.close();
    });

    it('responds to /', () => {
        return request(server)
            .get('/')
            .expect(200);
    });

    it('404 everything else', () => request(server)
        .get('/foo/gates')
        .expect(404));
});

