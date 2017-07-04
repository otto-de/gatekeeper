const ticketService = require('../../services/ticketService');

jest.mock('../../repositories/gateRepository', () => {
    return {
        findGate: jest.fn(),
        setGate: jest.fn(),
        checkGate: jest.fn(),
        addTicket: jest.fn()
    };
});
const gateRepositoryMock = require('../../repositories/gateRepository');

jest.mock('uuid/v4');
const uuidMock = require('uuid/v4');

describe('enterGate', () => {
    beforeEach(() => {
        gateRepositoryMock.findGate.mockReset();
        gateRepositoryMock.addTicket.mockReset();
    });

    it('simple: should let you enter the gate if its open', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: []});
        uuidMock.mockReturnValue('ticket1');

        const result = await ticketService.enterGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.OPEN, ticketId: 'ticket1'});
        expect(gateRepositoryMock.addTicket).toBeCalledWith('group', 'service', 'environment', 'ticket1');
    });

    it('simple: should let you not enter the gate if its closed', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.CLOSED, queue: []});

        const result = await ticketService.enterGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(gateRepositoryMock.addTicket).not.toBeCalled();
    });

    it('simple: should let you not enter the gate if there is a ticket', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.enterGate('group', 'service', 'environment', false, false);
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(gateRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should give you a ticket if the gate is locked', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});
        uuidMock.mockReturnValue('ticket2');

        const result = await ticketService.enterGate('group', 'service', 'environment', true, false);
        expect(result).toEqual({state: ticketService.LOCKED, ticketId: 'ticket2'});
        expect(gateRepositoryMock.addTicket).toBeCalledWith('group', 'service', 'environment', 'ticket2');
    });

    it('queue: should let you enter if your ticket is the first in queue', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.enterGate('group', 'service', 'environment', true, 'ticket1');
        expect(result).toEqual({state: ticketService.OPEN, ticketId: 'ticket1'});
        expect(gateRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should let you not enter if your ticket is in the queue but is not the first', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1', 'ticket2']});

        const result = await ticketService.enterGate('group', 'service', 'environment', true, 'ticket2');
        expect(result).toEqual({state: ticketService.LOCKED, ticketId: 'ticket2'});
        expect(gateRepositoryMock.addTicket).not.toBeCalled();
    });

    it('queue: should let you not enter if your ticket not in the queue', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: ticketService.OPEN, queue: ['ticket1']});

        const result = await ticketService.enterGate('group', 'service', 'environment', true, 'ticket2');
        expect(result).toEqual({state: ticketService.CLOSED});
        expect(gateRepositoryMock.addTicket).not.toBeCalled();
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