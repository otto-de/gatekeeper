import R from 'ramda'

const REMOVE_TICKET = 'gatekeeper/gate/ticket/REMOVE';

export default function reducer(state = {}, action = {}) {
    switch (action.type) {
        case REMOVE_TICKET:
            let ticketPath = R.lensPath([action.group, action.service, action.env, 'tickets']);
            let tickets = R.view(ticketPath, state);
            return R.set(ticketPath, R.without([action.ticketId], tickets), state);
        default:
            return state;
    }
}

export function removeTicket(group, service, env, ticketId) {
    return {type: REMOVE_TICKET, group, service, env, ticketId};
}
}
