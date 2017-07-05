const request = require('supertest');

jest.mock('../../services/gateService', () => {
    return {
        createOrUpdateService: jest.fn(),
        findGate: jest.fn(),
        setGateState: jest.fn(),
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
        gateServiceMock.setGateState.mockReset();
        gateServiceMock.deleteService.mockReset();
    });

    afterAll(() => {
        server.close();
    });

    it('should return a gate with GET on /api/gates/group/service/environment', () => {
            gateServiceMock.findGate.mockReturnValue({gate: 'gate'});
            return request(server)
                .get('/api/gates/group/service/environment')
                .expect(200, {gate: 'gate'})
                .then(() => expect(gateServiceMock.findGate).toBeCalledWith('group', 'service', 'environment'));
        }
    );

    it('should return 404 if gate not exist', () => {
            gateServiceMock.findGate.mockReturnValue(null);
            return request(server)
                .get('/api/gates/group/service/environment')
                .expect(404, 'Gate not found');
        }
    );

    it('called service on POST on /api/gates', () => {
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

    it('returns 500 when gate cannot be created', () => {
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

    it('should return an error on create gate', () => {
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

    it('should close the gate', () => {
            gateServiceMock.setGateState.mockReturnValue({status: 'open'});
            return request(server)
                .put('/api/gates/group/service/environment')
                .send({open: false})
                .expect(200, {status: 'open'});
        }
    );

    it('should return 404 if user tries to close a gate that does not exist', () => {
            gateServiceMock.setGateState.mockReturnValue(null);
            return request(server)
                .put('/api/gates/group/service/environment')
                .send({open: false})
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
                .expect(404, 'Service not found');
        }
    );
});

