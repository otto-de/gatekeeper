import R from 'ramda'

const ADD_TICKET = 'gatekeeper/gate/ticket/ADD';
const REMOVE_TICKET = 'gatekeeper/gate/ticket/REMOVE';
const SET_MANUAL_GATE_STATE = 'gatekeeper/gate/manual_gate/SET';
const SET_AUTO_GATE_STATE = 'gatekeeper/gate/auto_gate/SET';

export default function reducer(state = {}, action = {}) {
    let ticketPath = R.lensPath([action.group, action.service, action.env, 'tickets']);
    let manualStatePath = R.lensPath([action.group, action.service, action.env, 'manual_state']);
    let autoStatePath = R.lensPath([action.group, action.service, action.env, 'auto_state']);
    let tickets = R.view(ticketPath, state);
    switch (action.type) {
        case ADD_TICKET:
            return R.set(ticketPath, R.append(action.ticketId, tickets), state);
        case REMOVE_TICKET:
            return R.set(ticketPath, R.without([action.ticketId], tickets), state);
        case SET_MANUAL_GATE_STATE:
            return R.set(manualStatePath, action.state, state);
        case SET_AUTO_GATE_STATE:
            return R.set(autoStatePath, action.state, state);
        default:
            return state;
    }
}

export function removeTicket(group, service, env, ticketId) {
    return {type: REMOVE_TICKET, group, service, env, ticketId};
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
