const request = require('supertest');

jest.mock('uuid/v4', () => 'mock_uuid');

describe('the tickets route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    it('should create a new ticket and pass it when gate is open and no other ticket is queued', () => {
        return request(server)
            .post('/api/tickets/group/service/environment')
            .send()
            .expect(201, {state: 'passed', ticket: 'mock_uuid'})
    });

});

