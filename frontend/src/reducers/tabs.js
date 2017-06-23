const SWITCH_TAB = 'gatekeeper/tabs/SWITCH';

export default function reducer(state = {}, action = {}) {
    switch (action.type) {
        case SWITCH_TAB:
            return {...state, active_tab:action.tabId};
        default:
            return state;
    }
};

export function switchTab(tabId) {
    return {type: SWITCH_TAB, tabId};
}