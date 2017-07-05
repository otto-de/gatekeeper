const gateService = require('../../services/gateService');

jest.mock('../../repositories/gateRepository', () => {
    return {
        findGate: jest.fn(),
        setGateState: jest.fn(),
        deleteService: jest.fn(),
    };
});
const gateRepositoryMock = require('../../repositories/gateRepository');

describe('the gate service', () => {

    beforeEach(() => {
        gateRepositoryMock.findGate.mockReset();
        gateRepositoryMock.setGateState.mockReset();
        gateRepositoryMock.deleteService.mockReset();
    });

    it('get gate', () => {
        gateRepositoryMock.findGate.mockReturnValue({state: gateService.OPEN});
        const result = gateService.findGate('group1', 'service', 'environment');
        expect(result).toBeTruthy();
    });

    it('get gate does not crash if no gate is found', async () => {
        gateRepositoryMock.findGate.mockReturnValue(null);
        const result = await gateService.findGate('group', 'service', 'environment');
        expect(result).toBeFalsy();
    });

    it('should close gate when so requested', async () => {
        gateRepositoryMock.setGateState.mockReturnValue({'state': gateService.CLOSED});

        const result = await gateService.setGateState('group', 'service', 'environment', false);
        expect(result).toEqual({state: gateService.CLOSED});
        expect(gateRepositoryMock.setGateState).toBeCalledWith('group', 'service', 'environment', false);
    });

    it('delete service', async () => {
        gateRepositoryMock.deleteService.mockReturnValue(true);

        const result = await gateService.deleteService('group', 'service');
        expect(result).toEqual(true);
        expect(gateRepositoryMock.deleteService).toBeCalledWith('group', 'service');
    });

});
