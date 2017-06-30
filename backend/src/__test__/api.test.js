const request = require('supertest');

jest.mock('../services/gateService', () => {
    return {
        createGate: jest.fn(() => {
            console.log('I didnt call the original')
        })
    }
});
const gateServiceMock = require('../services/gateService');

describe('the backend server', () => {

    let server;
    beforeAll(() => {
        // Set up some mocked out file info before each test
        server = require('../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    it('responds to /', () => request(server)
        .get('/')
        .expect(200));

    it('returns 404 on unknown paths', () => request(server)
        .get('/foo/gates')
        .expect(404)
    );

    it('called service on POST on /api/gates', () => {
            let result = request(server)
                .post('/api/gates')
                .send(
                    {
                        service: 'myService',
                        group: 'myGroup',
                        environments: ['env1', 'env2']
                    }
                )
                .expect(201)
                .then(() => expect(gateServiceMock.createGate).toBeCalledWith('myService', 'myGroup', ['env1', 'env2']));
            return result;
        }
    );
});

