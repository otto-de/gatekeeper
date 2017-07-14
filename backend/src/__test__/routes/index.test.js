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

    it('returns 200 on all paths', () => {
            return request(server)
                .get('/group/ftx')
                .expect(200);
        }
    );
});
