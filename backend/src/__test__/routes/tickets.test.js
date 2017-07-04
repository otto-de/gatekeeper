const request = require('supertest');

jest.mock('../../services/gateService', () => {
    return {
        createOrUpdateService: jest.fn(),
        isOpen: jest.fn(),
        setGate: jest.fn(),
        enterGate: jest.fn()
    };
});
const gateServiceMock = require('../../services/gateService');

describe('the tickets route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    it('should simply enter the gate without queuing or ticket', () => {
            gateServiceMock.enterGate.mockReturnValue({status: 'open'});
            return request(server)
                .put('/api/tickets/group/service/environment')
                .send()
                .expect(200, {status: 'open'})
                .then(() => expect(gateServiceMock.enterGate).toBeCalledWith('group', 'service', 'environment', false, false));
        }
    );

    it('should enter the gate with queuing and ticket', () => {
            gateServiceMock.enterGate.mockReturnValue({status: 'open'});
            return request(server)
                .put('/api/tickets/group/service/environment')
                .send({queue: true, ticketId: '0000'})
                .expect(200, {status: 'open'})
                .then(() => expect(gateServiceMock.enterGate).toBeCalledWith('group', 'service', 'environment', true, '0000'));
        }
    );

    it('on gate enter it should return 404 if gate does not exist', () => {
            gateServiceMock.enterGate.mockReturnValue(null);
            return request(server)
                .put('/api/tickets/group/service/environment')
                .expect(404, 'Gate not found');
        }
    );

});

