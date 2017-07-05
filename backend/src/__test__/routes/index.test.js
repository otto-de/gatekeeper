const request = require('supertest');

describe('index route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    it('responds to /', () => {
        return request(server)
            .get('/')
            .expect(200);
    });

    it('returns 404 on unknown paths', () => {
            return request(server)
                .get('/foo/gates')
                .expect(404);
        }
    );
});
