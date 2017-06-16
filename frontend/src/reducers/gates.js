import R from 'ramda'

const ADD_TICKET = 'gatekeeper/gate/ticket/ADD';
const REMOVE_TICKET = 'gatekeeper/gate/ticket/REMOVE';

export default function reducer(state = {}, action = {}) {
    let ticketPath = R.lensPath([action.group, action.service, action.env, 'tickets']);
    let tickets = R.view(ticketPath, state);
    switch (action.type) {
        case ADD_TICKET:
            return R.set(ticketPath, R.append(action.ticketId, tickets), state);
        case REMOVE_TICKET:
            return R.set(ticketPath, R.without([action.ticketId], tickets), state);
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
