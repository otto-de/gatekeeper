const gateRepository = require('../../repositories/gateRepository');

describe('the repository', () => {
    it('should add a new environment to existing', () => {

        let currentEnvironments = {
            "live": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            },
            "develop": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            }
        };
        //when
        let updatedEnvironments = gateRepository.updateEnvironments(currentEnvironments, ['fit', 'live', 'develop']);

        //then
        let expectedEnvironments = {
            "live": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            },
            "develop": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            },
            "fit": {
                "queue": [],
                "message_timestamp": "",
                "state": "closed",
                "message": "",
                "state_timestamp": ""
            }
        };


        expect(updatedEnvironments).toEqual(expectedEnvironments);
    });

    it('should remove existing environments', () => {
        let currentEnvironments = {
            "live": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            },
            "develop": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            }
        };

        //when
        let updatedEnvironments = gateRepository.updateEnvironments(currentEnvironments, ['develop']);

        //then
        let expectedEnvironments = {
            "develop": {
                "queue": [],
                "message_timestamp": "",
                "state": "open",
                "message": "",
                "state_timestamp": "2016-04-06 22:17:54+0200"
            }
        };
        expect(updatedEnvironments).toEqual(expectedEnvironments);

    });

});


describe('the repository', () => {
    it('should update environments in the database', () => {
        //given


        //when
        gateRepository.createOrUpdateService("myService", 'myGroup', ['env1', 'env2']);
        //then
        //TODO

    })
});
