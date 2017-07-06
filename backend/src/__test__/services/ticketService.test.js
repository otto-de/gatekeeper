const ticketService = require('../../services/ticketService');

jest.mock('../../services/gateService', () => {
    return {
        findGate: jest.fn(),
        setGate: jest.fn(),
        checkGate: jest.fn(),
    };
});
const gateServiceMock = require('../../services/gateService');

jest.mock('../../repositories/ticketRepository', () => {
    return {
        findGate: jest.fn(),
        setGate: jest.fn(),
        checkGate: jest.fn(),
        addTicket: jest.fn(),
        deleteTicket: jest.fn()
    };
});
const ticketRepositoryMock = require('../../repositories/ticketRepository');

jest.mock('uuid/v4');
const uuidMock = require('uuid/v4');

describe('lockGate', () => {
    beforeEach(() => {
        gateServiceMock.findGate.mockReset();
        ticketRepositoryMock.addTicket.mockReset();
    });

    it('simple: should let you enter the gate if its open', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: []});
        uuidMock.mockReturnValue('ticket1');

        const result = await ticketService.lockGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.OPEN, ticketId: 'ticket1'});
        expect(ticketRepositoryMock.addTicket).toBeCalledWith('group', 'service', 'environment', 'ticket1');
    });

    it('simple: should let you not enter the gate if its closed', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.CLOSED, queue: []});

        const result = await ticketService.lockGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });

    it('simple: should let you not enter the gate if there is a ticket', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.lockGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should give you a ticket if the gate is locked', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});
        uuidMock.mockReturnValue('ticket2');

        const result = await ticketService.lockGate('group', 'service', 'environment', true, false);
        expect(result).toEqual({state: ticketService.LOCKED, ticketId: 'ticket2'});
        expect(ticketRepositoryMock.addTicket).toBeCalledWith('group', 'service', 'environment', 'ticket2');
    });

    it('queue: should let you enter if your ticket is the first in queue', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.lockGate('group', 'service', 'environment', true, 'ticket1');
        expect(result).toEqual({state: ticketService.OPEN, ticketId: 'ticket1'});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should let you not enter if your ticket is in the queue but is not the first', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1', 'ticket2']});

        const result = await ticketService.lockGate('group', 'service', 'environment', true, 'ticket2');
        expect(result).toEqual({state: ticketService.LOCKED, ticketId: 'ticket2'});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should let you not enter if your ticket not in the queue', async () => {
        gateServiceMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.lockGate('group', 'service', 'environment', true, 'ticket2');
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });
});

describe('check gate', () => {
    it('the gate is open', () => {
        const gate = {
            state: ticketService.OPEN,
            queue: [],
        };
        expect(ticketService.checkGate(gate)).toEqual(ticketService.OPEN);
    });

    it('the gate is closed', () => {
        const gate = {
            state: ticketService.CLOSED,
            queue: [],
        };
        expect(ticketService.checkGate(gate)).toEqual(ticketService.CLOSED);
    });

    it('the gate is locked because of a ticket', () => {
        const gate = {
            state: ticketService.OPEN,
            queue: ['ticket1'],
        };
        expect(ticketService.checkGate(gate)).toEqual(ticketService.LOCKED);
    });

    it('the gate is closed manually and by ticket', () => {
        const gate = {
            state: ticketService.CLOSED,
            queue: ['ticket1'],
        };
        expect(ticketService.checkGate(gate)).toEqual(ticketService.CLOSED);
    });

    it('the gate is closed, ignore tickets', () => {
        const gate = {
            state: ticketService.CLOSED,
            queue: [],
        };
        expect(ticketService.checkGate(gate, 'ticket1')).toEqual(ticketService.CLOSED);
    });

    it('the gate is open and my ticket is the first in line', () => {
        const gate = {
            state: ticketService.OPEN,
            queue: ['ticket1', 'ticket2'],
        };
        expect(ticketService.checkGate(gate, 'ticket1')).toEqual(ticketService.OPEN);
    });

    it('the gate is open and but my ticket is not the first', () => {
        const gate = {
            state: ticketService.OPEN,
            queue: ['ticket0', 'ticket1'],
        };
        expect(ticketService.checkGate(gate, 'ticket1')).toEqual(ticketService.LOCKED);
    });

    it('the gate is open and but my ticket is not in the queue', () => {
        const gate = {
            state: ticketService.OPEN,
            queue: ['ticket1'],
        };
        expect(ticketService.checkGate(gate, 'ticket2')).toEqual(ticketService.CLOSED);
    });
});

describe('addTicket', () => {

    beforeEach(() => {
        ticketRepositoryMock.addTicket.mockReset();
    });

    it('should return with given ticket', async () => {
        ticketRepositoryMock.addTicket.mockReturnValue(null);

        const result = await ticketService.addTicket('group', 'service', 'environment', ticketService.LOCKED, 'ticket1');
        expect(result).toEqual({state: ticketService.LOCKED, ticketId: 'ticket1'});
        expect(ticketRepositoryMock.addTicket).not.toBeCalled();
    });

    it('should return with new ticket and add it to database', async () => {
        ticketRepositoryMock.addTicket.mockReturnValue(null);
        uuidMock.mockReturnValue('ticket2');

        const result = await ticketService.addTicket('group', 'service', 'environment', ticketService.OPEN, false);
        expect(result).toEqual({state: ticketService.OPEN, ticketId: 'ticket2'});
        expect(ticketRepositoryMock.addTicket).toBeCalledWith('group', 'service', 'environment', 'ticket2');
    });
});

describe('unlockGate', () => {

    beforeEach(() => {
        ticketRepositoryMock.deleteTicket.mockReset();
    });

    it('delete ticket', async () => {
        ticketRepositoryMock.deleteTicket.mockReturnValue(null);

        const result = await ticketService.unlockGate('group', 'service', 'environment', 'ticket1');
        expect(result).toEqual(null);
        expect(ticketRepositoryMock.deleteTicket).toBeCalledWith('group', 'service', 'environment', 'ticket1');
    });
});