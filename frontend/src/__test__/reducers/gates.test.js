import reducer, {removeTicket} from '../../reducers/gates';

describe('Gates reducer', () => {

    const state = {
        ftX: {
            gatekeeper: {
                test: {
                    tickets: ['ticket01', 'ticket02']
                }
            }
        }
    };

    it('should remove "ticket01" from array', () => {
        let actionRemoveTicket = removeTicket('ftX', 'gatekeeper', 'test', 'ticket01');
        let stateWithoutATicket = reducer(state, actionRemoveTicket);
        expect(stateWithoutATicket.ftX.gatekeeper.test.tickets).toEqual(expect.arrayContaining(['ticket02']))
    });

});