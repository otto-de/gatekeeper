import reducer, {openEditServiceDialog, openAddServiceDialog, closeEditServiceDialog} from '../../reducers/dialog';

describe('Dialog reducer', () => {
    const state = {
        editService: {
            group: '',
            service: '',
            show: false
        }
    };

    it('should open edit service dialog', () => {
        let action = openEditServiceDialog('ftX', 'gatekeeper');
        let newState = reducer(state, action);
        let expectedState = {
            editService: {
                group: 'ftX',
                service: 'gatekeeper',
                show: true
            }
        };
        expect(newState).toEqual(expectedState)
    });

    it('should open add service dialog', () => {
        let action = openAddServiceDialog();
        let newState = reducer(state, action);
        let expectedState = {
            editService: {
                group: '',
                service: '',
                show: true
            }
        };
        expect(newState).toEqual(expectedState)
    });
    it('should close service dialog', () => {
        let action = closeEditServiceDialog();
        let newState = reducer(state, action);
        let expectedState = {
            editService: {
                group: '',
                service: '',
                show: false
            }
        };
        expect(newState).toEqual(expectedState)
    });


});