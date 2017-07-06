const request = require('supertest');

jest.mock('../../services/ticketService', () => {
    return {
        createOrUpdateService: jest.fn(),
        setGate: jest.fn(),
        unlockGate: jest.fn(),
        lockGate: jest.fn()
    };
});
const ticketServiceMock = require('../../services/ticketService');

describe('tickets route', () => {
    let server;
    beforeAll(() => {
        server = require('../../bin/www');
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        ticketServiceMock.createOrUpdateService.mockReset();
        ticketServiceMock.setGate.mockReset();
        ticketServiceMock.unlockGate.mockReset();
        ticketServiceMock.lockGate.mockReset();
    });

    it('should simply enter the gate without queuing or ticket', () => {
            ticketServiceMock.lockGate.mockReturnValue({status: 'open'});
            return request(server)
                .put('/api/tickets/group/service/environment')
                .send()
                .expect(200, {status: 'open'})
                .then(() => expect(ticketServiceMock.lockGate).toBeCalledWith('group', 'service', 'environment', false, false));
        }
    );

    it('should enter the gate with queuing and ticket', () => {
            ticketServiceMock.lockGate.mockReturnValue({status: 'open'});
            return request(server)
                .put('/api/tickets/group/service/environment')
                .send({queue: true, ticketId: '0000'})
                .expect(200, {status: 'open'})
                .then(() => expect(ticketServiceMock.lockGate).toBeCalledWith('group', 'service', 'environment', true, '0000'));
        }
    );

    it('on gate enter it should return 404 if gate does not exist', () => {
            ticketServiceMock.lockGate.mockReturnValue(null);
            return request(server)
                .put('/api/tickets/group/service/environment')
                .expect(404, 'Gate not found');
        }
    );

    it('should delete a ticket', () => {
            ticketServiceMock.unlockGate.mockReturnValue(null);
            return request(server)
                .del('/api/tickets/group/service/environment/ticket1')
                .send()
                .expect(204)
                .then(() => expect(ticketServiceMock.unlockGate).toBeCalledWith('group', 'service', 'environment', 'ticket1'));
        }
    );

});

