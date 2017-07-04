const gateService = require('../../services/gateService');

jest.mock('../../repositories/gateRepository', () => {
    return {
        findGate: jest.fn(),
        setGate: jest.fn(),
    };
});
const gateRepositoryMock = require('../../repositories/gateRepository');

describe('the gate service', () => {

    beforeEach(() => {
        gateRepositoryMock.findGate.mockReset();
        gateRepositoryMock.setGate.mockReset();
    });

    it('the gate is open', () => {
        gateRepositoryMock.findGate.mockReturnValue({state: gateService.OPEN});
        const result = gateService.isOpen('group1', 'service', 'environment');
        expect(result).toBeTruthy();
    });

    it('does not crash if no gate is found', async () => {
        gateRepositoryMock.findGate.mockReturnValue(null);
        const result = await gateService.isOpen('group', 'service', 'environment');
        expect(result).toBeFalsy();
    });

    it('should close gate when so requested', async () => {
        gateRepositoryMock.setGate.mockReturnValue({'state': gateService.CLOSED});

        const result = await gateService.setGate('group', 'service', 'environment', false);
        expect(result).toEqual({state: gateService.CLOSED});
        expect(gateRepositoryMock.setGate).toBeCalledWith('group', 'service', 'environment', false);
    });

});
