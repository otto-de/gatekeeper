import R from 'ramda';
import { RECEIVE_STATE, RECEIVE_DELETE_SERVICE, RECEIVE_UPDATE_GATE } from '../enhancers/sse';

const ADD_TICKET = 'gatekeeper/gate/ticket/ADD';
const SET_MANUAL_GATE_STATE = 'gatekeeper/gate/manual_gate/SET';
const SET_AUTO_GATE_STATE = 'gatekeeper/gate/auto_gate/SET';
const SET_COMMENT = 'gatekeeper/gate/comment/SET';
const SET_LAST_MODIFIED = 'gatekeeper/gate/last_modified/SET';
const SET_EDIT_COMMENT_DIALOG = 'gatekeeper/gate/comment_edit_dialog/SET';

export default function reducer(state = {}, action = {}) {
    let ticketsQueuePath = R.lensPath([action.group, action.service, action.env, 'queue']);
    let manualStatePath = R.lensPath([action.group, action.service, action.env, 'manual_state']);
    let autoStatePath = R.lensPath([action.group, action.service, action.env, 'auto_state']);
    let commentPath = R.lensPath([action.group, action.service, action.env, 'comment']);
    let lastModifiedPath = R.lensPath([action.group, action.service, action.env, 'last_modified']);
    let editCommentDialogPath = R.lensPath([action.group, action.service, action.env, 'show_comment_edit_dialog']);
    let ticketsQueue = R.view(ticketsQueuePath, state);
    switch (action.type) {
        case ADD_TICKET:
            return R.set(ticketsQueuePath, R.append(action.ticketId, ticketsQueue), state);
        case SET_MANUAL_GATE_STATE:
            return R.set(manualStatePath, action.state, state);
        case SET_AUTO_GATE_STATE:
            return R.set(autoStatePath, action.state, state);
        case SET_COMMENT:
            return R.set(commentPath, action.comment, state);
        case SET_LAST_MODIFIED:
            return R.set(lastModifiedPath, action.last_modified, state);
        case SET_EDIT_COMMENT_DIALOG:
            return R.set(editCommentDialogPath, action.show_comment_edit_dialog, state);
        case RECEIVE_STATE:
            return {...action.state.gates};
        case RECEIVE_DELETE_SERVICE:
            let newState = {...state};
            let group = newState[action.group];
            let serviceNames = Object.keys(group);
            let groupWithServiceRemoved = R.pick(R.without([action.service], serviceNames), group);
            if(Object.keys(groupWithServiceRemoved).length === 0) {
                delete newState[action.group];
            } else {
                newState[action.group] = groupWithServiceRemoved;
            }
            return newState;
        case RECEIVE_UPDATE_GATE:
            return R.set(R.lensPath([action.group, action.service, action.environment]), action.gate, state);
        default:
            return state;
    }
}

export function addTicket(group, service, env, ticketId) {
    return {type: ADD_TICKET, group, service, env, ticketId};
}

export function setManualState(group, service, env, state) {
    return {type: SET_MANUAL_GATE_STATE, group, service, env, state};
}

export function setAutoState(group, service, env, state) {
    return {type: SET_AUTO_GATE_STATE, group, service, env, state};
}

export function setComment(group, service, env, comment) {
    return {type: SET_COMMENT, group, service, env, comment};
}

export function setLastModified(group, service, env, last_modified) {
    return {type: SET_LAST_MODIFIED, group, service, env, last_modified};
}

export function setCommentEditDialog(group, service, env, show_comment_edit_dialog) {
    return {type: SET_EDIT_COMMENT_DIALOG, group, service, env, show_comment_edit_dialog}
}
