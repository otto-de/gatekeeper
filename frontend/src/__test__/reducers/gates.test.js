import reducer, {addTicket, setManualState, setAutoState, setComment, setLastModified, setCommentEditDialog} from '../../reducers/gates';
import {deleteTicketResponse} from '../../enhancers/api';
import {receiveUpdateGate} from '../../enhancers/sse';

describe('Gates reducer', () => {
    const state = {
        ftX: {
            gatekeeper: {
                test: {
                    manual_state: true,
                    queue: ['ticket01', 'ticket02'],
                    show_comment_edit_dialog: false,
                    message: "old comment"
                }
            }
        }
    };

    it('should remove "ticket01" from array', () => {
        let actionRemoveTicket = deleteTicketResponse('ftX', 'gatekeeper', 'test', 'ticket01');
        let stateWithoutATicket = reducer(state, actionRemoveTicket);
        expect(stateWithoutATicket.ftX.gatekeeper.test.queue).toEqual(expect.arrayContaining(['ticket02']))
    });

    it('should add "ticket 03" to array', () => {
        let actionAddTicket = addTicket('ftX', 'gatekeeper', 'test', 'ticket03');
        let stateWithTicket = reducer(state, actionAddTicket);
        expect(stateWithTicket.ftX.gatekeeper.test.queue).toEqual(expect.arrayContaining(['ticket03']))
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

    it('should open the comment edit dialog', () => {
        let actionSetCommentEditDialog = setCommentEditDialog('ftX', 'gatekeeper', 'test', 'now');
        let withOpenCommentDialog = reducer(state, actionSetCommentEditDialog);
        expect(withOpenCommentDialog.ftX.gatekeeper.test.show_comment_edit_dialog).toBeTruthy()
    });

    it('should update gate state on updateState event', () => {
        let gate = {message:'new comment', queue: ['t1'], state: 'open', state_timestamp:13337};
        let action = receiveUpdateGate({group:'ftX', service:'gatekeeper', environment:'test', gate:gate});
        let withNewComment = reducer(state, action);
        expect(withNewComment.ftX.gatekeeper.test).toEqual({
            message: 'new comment',
            queue: ["t1"],
            manual_state: true,
            last_modified: 13337,
            state: true
        });
    });
});