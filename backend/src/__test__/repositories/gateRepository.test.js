const gateRepository = require('../../repositories/gateRepository');
const db = require('../../repositories/database');

describe('gateRepository', () => {

    beforeEach(async () => {
        const gatekeeperCollection = db.get('gatekeeper');
        await gatekeeperCollection.drop();
    });

    afterAll(() => {
        db.close();
    });

    it('should add a new environment to existing', () => {
        let currentEnvironments = {
            'live': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            },
            'develop': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            }
        };
        //when
        let updatedEnvironments = gateRepository.updateEnvironments(currentEnvironments, ['fit', 'live', 'develop']);

        //then
        let expectedEnvironments = {
            'live': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            },
            'develop': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            },
            'fit': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': ''
            }
        };

        expect(updatedEnvironments).toEqual(expectedEnvironments);
    });

    it('should remove existing environments', () => {
        let currentEnvironments = {
            'live': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            },
            'develop': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            }
        };

        //when
        let updatedEnvironments = gateRepository.updateEnvironments(currentEnvironments, ['develop']);

        //then
        let expectedEnvironments = {
            'develop': {
                'queue': [],
                'message_timestamp': '',
                'state': 'open',
                'message': '',
                'state_timestamp': '2016-04-06 22:17:54+0200'
            }
        };
        expect(updatedEnvironments).toEqual(expectedEnvironments);

    });

    it('should update environments in the database', async () => {
        //given
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2']);

        //when
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env2', 'env3']);
        //then
        let gateEnv3 = await gateRepository.findGate('myGroup', 'myService', 'env3');
        let expectedGate = {
            'queue': [],
            'message_timestamp': '',
            'state': 'open',
            'message': '',
            'state_timestamp': ''
        };
        expect(gateEnv3).toEqual(expectedGate);


        let gateEnv1 = await gateRepository.findGate('myGroup', 'myService', 'env1');
        expect(gateEnv1).toEqual(null);
    });


    it('should create environments in the database', async () => {
        //given

        //when
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2']);
        //then
        let gateEnv1 = await gateRepository.findGate('myGroup', 'myService', 'env1');

        let expectedGate = {
            'queue': [],
            'message_timestamp': '',
            'state': 'open',
            'message': '',
            'state_timestamp': ''
        };
        expect(gateEnv1).toEqual(expectedGate);

        let gateEnv2 = await gateRepository.findGate('myGroup', 'myService', 'env2');
        expect(gateEnv2).toEqual(expectedGate);
    });

    it('should close the gate', async () => {
        //when
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2']);

        //when
        let state = await gateRepository.setGateState('myGroup', 'myService', 'env1', false);

        //then
        expect(state).toEqual({state: 'closed'});

        let gate = await gateRepository.findGate('myGroup', 'myService', 'env1');
        expect(gate.state).toEqual('closed');
    });

    it('should delete a service', async () => {
        //given
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2']);

        //when
        let state = await gateRepository.deleteService('myGroup', 'myService');

        //then
        expect(state).toEqual(true);

        let result = await gateRepository.findGate('myGroup', 'myService', 'env1');
        expect(result).toEqual(null);
    });

});
