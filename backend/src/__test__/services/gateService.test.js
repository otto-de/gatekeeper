const gateService = require('../../services/gateService');

jest.mock('../../repositories/gateRepository', () => {
    return {
        findGate: jest.fn(),
        setGate: jest.fn(),
        deleteService: jest.fn(),
        getAll: jest.fn()
    };
});
const gateRepositoryMock = require('../../repositories/gateRepository');

let constDate = new Date('2017-06-13T04:41:20');
/*eslint no-global-assign:off*/
Date = class extends Date {
    constructor() {
        super();
        return constDate;
    }
};

describe('the gate service', () => {

    beforeEach(() => {
        gateRepositoryMock.findGate.mockReset();
        gateRepositoryMock.setGate.mockReset();
        gateRepositoryMock.deleteService.mockReset();
        gateRepositoryMock.getAll.mockReset();
    });

    it('get all gates', async () => {
        gateRepositoryMock.getAll.mockReturnValue([
            {
                '_id': '596361b83cbb14189f29d72c',
                'group': 'myGroup',
                'name': 'myService',
                'environments': {
                    'env1': {message: 'gate1', state:'open', queue:[]},
                    'env2': {message: 'gate2', state:'open', queue:['t1']}
                }
            },
            {
                '_id': '596367aa1cbe1b1a1a8e4086',
                'group': 'edo',
                'name': 'yada',
                'environments': {
                    'live': {message:'live-gate', state:'closed', queue:[]},
                    'plop': {message:'plop-gate', state:'closed', queue:['t1']}
                }
            }
        ]);

        const result = await gateService.getAllGates();

        expect(result).toEqual({
            gates: {myGroup: {myService: {
                env1: {message: 'gate1', state:'open', queue:[], auto_state: "open"},
                env2: {message: 'gate2', state:'open', queue:['t1'], auto_state: "closed"}
            }}, edo: {yada: {
                live: {message:'live-gate', state:'closed', queue:[], auto_state: "open"},
                plop: {message:'plop-gate', state:'closed', queue:['t1'], auto_state: "closed"}
            }}
            }
        });
    });

    it('get gate', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: 'open'});
        const result = await gateService.findGate('group1', 'service', 'environment');
        expect(result).toBeTruthy();
    });

    it('get gate does not crash if no gate is found', async () => {
        gateRepositoryMock.findGate.mockReturnValue(null);
        const result = await gateService.findGate('group', 'service', 'environment');
        expect(result).toBeFalsy();
    });

    it('should gate set gate state and generate timestamp', async () => {
        gateRepositoryMock.setGate.mockReturnValue(true);

        const result = await gateService.setGate('group', 'service', 'environment', 'open');
        expect(result).toEqual(true);
        expect(gateRepositoryMock.setGate).toBeCalledWith('group', 'service', 'environment', 'open', constDate.getTime(), undefined);
    });

    it('should gate set gate message', async () => {
        gateRepositoryMock.setGate.mockReturnValue(true);

        const result = await gateService.setGate('group', 'service', 'environment', undefined, 'a message');
        expect(result).toEqual(true);
        expect(gateRepositoryMock.setGate).toBeCalledWith('group', 'service', 'environment', undefined, undefined, 'a message');
    });

    it('delete service', async () => {
        gateRepositoryMock.deleteService.mockReturnValue(true);

        const result = await gateService.deleteService('group', 'service');
        expect(result).toEqual(true);
        expect(gateRepositoryMock.deleteService).toBeCalledWith('group', 'service');
    });

    it('should derive "auto_state" value witch ticket queue', async () => {
        gateRepositoryMock.findGate.mockReturnValue({state: 'open'});
        const enhancedGate = await gateService.findGate('group1', 'service', 'environment');
        expect(enhancedGate).toEqual({'auto_state': 'open', 'state': 'open'});
    });

});
