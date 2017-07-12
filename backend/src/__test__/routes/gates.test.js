const request = require('supertest');

jest.mock('../../services/gateService', () => {
    return {
        createOrUpdateService: jest.fn(),
        findGate: jest.fn(),
        setGate: jest.fn(),
        deleteService: jest.fn()
    };
});
const gateServiceMock = require('../../services/gateService');

describe('gates route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    beforeEach(() => {
        gateServiceMock.createOrUpdateService.mockReset();
        gateServiceMock.findGate.mockReset();
        gateServiceMock.setGate.mockReset();
        gateServiceMock.deleteService.mockReset();
    });

    afterAll(() => {
        server.close();
    });

    it('GET: should return a gate with GET on /api/gates/group/service/environment', () => {
            gateServiceMock.findGate.mockReturnValue({gate: 'gate'});
            return request(server)
                .get('/api/gates/group/service/environment')
                .expect(200, {gate: 'gate'})
                .then(() => expect(gateServiceMock.findGate).toBeCalledWith('group', 'service', 'environment'));
        }
    );

    it('GET: should return 404 if gate not exist', () => {
            gateServiceMock.findGate.mockReturnValue(null);
            return request(server)
                .get('/api/gates/group/service/environment')
                .expect(404, 'Gate not found');
        }
    );

    it('POST: create a gate', () => {
            return request(server)
                .post('/api/gates')
                .send(
                    {
                        service: 'myService',
                        group: 'myGroup',
                        environments: ['env1', 'env2']
                    }
                )
                .expect(201)
                .then(() => expect(gateServiceMock.createOrUpdateService).toBeCalledWith('myGroup', 'myService', ['env1', 'env2']));
        }
    );

    it('POST: returns 500 when gate cannot be created', () => {
            return request(server)
                .post('/api/gates')
                .send(
                    {
                        service: 'myService',
                        group: 'myGroup',
                        environments: ['env1', 'env2']
                    }
                )
                .expect(201)
                .then(() => expect(gateServiceMock.createOrUpdateService).toBeCalledWith('myGroup', 'myService', ['env1', 'env2']));
        }
    );

    it('POST: should return an error on create gate', () => {
            const error = {
                'status': 400,
                'statusText': 'Bad Request',
                'errors': [{
                    'field': 'service',
                    'location': 'body',
                    'messages': ['"service" is not allowed to be empty'],
                    'types': ['any.empty']
                }, {
                    'field': 'group',
                    'location': 'body',
                    'messages': ['"group" is required'],
                    'types': ['any.required']
                }, {
                    'field': 'environments',
                    'location': 'body',
                    'messages': ['"environments" must contain at least 1 items'],
                    'types': ['array.min']
                }]
            };

            return request(server)
                .post('/api/gates')
                .send(
                    {
                        service: '',
                        environments: []
                    }
                )
                .expect(400)
                .then((res) => {
                    const response = JSON.parse(res.text);
                    expect(response).toEqual(error);
                });
        }
    );

    it('PUT: set the gate state to open', () => {
        gateServiceMock.setGate.mockReturnValue(true);

        return request(server)
            .put('/api/gates/group/service/environment')
            .send({state: 'open'})
            .expect(204);
    });

    it('PUT: the API should reject invalid gate states', () => {
        gateServiceMock.setGate.mockReturnValue(null);

        const error = {
            'status': 400,
            'statusText': 'Bad Request',
            'errors': [
                {
                    'field': 'state',
                    'location': 'body',
                    'messages': [
                        '\"state\" must be one of [open, closed]'
                    ],
                    'types': [
                        'any.allowOnly'
                    ],
                }
            ],
        };

        return request(server)
            .put('/api/gates/group/service/environment')
            .send({state: 'dog'})
            .expect(400)
            .then((res) => {
                const response = JSON.parse(res.text);
                expect(response).toEqual(error);
            });
    });

    it('PUT: set the gate message', () => {
        gateServiceMock.setGate.mockReturnValue(true);
        return request(server)
            .put('/api/gates/group/service/environment')
            .send({message: 'wip: should not go live jet'})
            .expect(204);
    });

    it('PUT: should return 404 the gate that does not exist', () => {
            gateServiceMock.setGate.mockReturnValue(null);
            return request(server)
                .put('/api/gates/group/service/environment')
                .send({state: 'closed'})
                .expect(404, 'Gate not found');
        }
    );

    it('DELETE: should delete a service on DELETE /api/gates/group/service', () => {
            gateServiceMock.deleteService.mockReturnValue(true);
            return request(server)
                .del('/api/gates/group/service')
                .expect(204)
                .then(() => expect(gateServiceMock.deleteService).toBeCalledWith('group', 'service'));
        }
    );

    it('DELETE: should return 404 if gate not exist', () => {
            gateServiceMock.deleteService.mockReturnValue(null);
            return request(server)
                .del('/api/gates/group/service')
                .expect(404, '{"status":"error","message":"unknown service: group/service"}');
        }
    );
});
