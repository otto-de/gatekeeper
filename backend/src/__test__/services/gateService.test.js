const gateService = require('../../services/gateService');

jest.mock('../../repositories/gateRepository', () => {
    return {
        findGate: jest.fn()
    }
});
const gateRepositoryMock = require('../../repositories/gateRepository');

describe('the gate service', () => {
    it('the gate is open', () => {
        gateRepositoryMock.findGate.mockReturnValue({state: 'open'});
        const result = gateService.isOpen('group1', 'service', 'environment');
        expect(result).toBeTruthy();
    });

    it('does not crash if no gate is found', () => {
        gateRepositoryMock.findGate.mockReturnValue(null);
        const result = gateService.isOpen('group', 'service', 'environment');
        expect(result).toBeFalsy();
    });
});

