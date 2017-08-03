const request = require('supertest');
jest.mock('../../repositories/database', () => {
    return {
        close: jest.fn(),
        then: jest.fn()
    }
});
jest.mock('../../config', () => {
    return {
        then: jest.fn()
    }
});

describe('internal route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    it('returns 200 and status ok in health endpoint', () => {
        return request(server)
            .get('/internal/health')
            .expect(200, {status: 'ok'});
    });
});
