import reducer, {removeTicket, addTicket, setManualState, setAutoState, setComment, setLastModified} from '../../reducers/gates';

describe('Gates reducer', () => {

    const state = {
        ftX: {
            gatekeeper: {
                test: {
                    manual_state: true,
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

    it('should set the manual_state', () => {
        let actionSetManualState = setManualState('ftX', 'gatekeeper', 'test', false);
        let withNewManualState = reducer(state, actionSetManualState);
        expect(withNewManualState.ftX.gatekeeper.test.manual_state).toBeFalsy();
    });

    it('should keep the manual_state', () => {
        let actionSetManualState = setManualState('ftX', 'gatekeeper', 'test', true);
        let withNewManualState = reducer(state, actionSetManualState);
        expect(withNewManualState.ftX.gatekeeper.test.manual_state).toBeTruthy();
    });

    it('should set the auto_state', () => {
        let actionSetAutoState = setAutoState('ftX', 'gatekeeper', 'test', false);
        let withNewAutoState = reducer(state, actionSetAutoState);
        expect(withNewAutoState.ftX.gatekeeper.test.auto_state).toBeFalsy();
    });

    it('should keep the auto_state', () => {
        let actionSetAutoState = setAutoState('ftX', 'gatekeeper', 'test', true);
        let withNewAutoState = reducer(state, actionSetAutoState);
        expect(withNewAutoState.ftX.gatekeeper.test.auto_state).toBeTruthy();
    });

    it('should set the comment', () => {
        let actionSetComment = setComment('ftX', 'gatekeeper', 'test', 'some comment');
        let withNewComment = reducer(state, actionSetComment);
        expect(withNewComment.ftX.gatekeeper.test.comment).toEqual('some comment');
    });

    it('should set last modified', () => {
        let actionSetLastModified = setLastModified('ftX', 'gatekeeper', 'test', 'now');
        let withNewLastModified = reducer(state, actionSetLastModified);
        expect(withNewLastModified.ftX.gatekeeper.test.last_modified).toEqual('now')
    });
});