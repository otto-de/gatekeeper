import R from 'ramda'

const REMOVE_TICKET = 'gatekeeper/gate/ticket/REMOVE';

export default function reducer(state = {}, action = {}) {
    switch (action.type) {
        case REMOVE_TICKET:
            return state;
        default:
            return state;
    }
}

export function removeTicket(ticketId) {
    return {type: REMOVE_TICKET, ticketId};
}
