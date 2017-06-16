import reducer, {removeTicket, addTicket} from '../../reducers/gates';

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

    it('should add "ticket 03" to array', () => {
        let actionAddTicket = addTicket('ftX', 'gatekeeper', 'test', 'ticket03');
        let stateWithTicket = reducer(state, actionAddTicket);
        expect(stateWithTicket.ftX.gatekeeper.test.tickets).toEqual(expect.arrayContaining(['ticket03']))
    });

});