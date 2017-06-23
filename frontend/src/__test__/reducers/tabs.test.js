import reducer, {switchTab} from '../../reducers/tabs';

describe('Tabs reducer', () => {
    const state = {
        'tabs': {
            active_tab: 0
        }
    };

    it('should switch "active_tab" from 0 to 1', () => {
        let actionSwitchTab = switchTab(1);
        let stateWithNewTab = reducer(state, actionSwitchTab);
        expect(stateWithNewTab.active_tab).toEqual(1);
    });
});