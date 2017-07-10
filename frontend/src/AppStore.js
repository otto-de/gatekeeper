import { createStore, applyMiddleware, compose} from 'redux';
import reducer from './reducers';
import sse from './enhancers/sse'

const initialState = {
    tabs: {
        active_tab: 0
    },
    dialog: {

    },
    gates: {
        group1: {
            service: {
                environment_1: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                },
                environment_3: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                }
            },
            service2: {
                environment_1: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                },
                environment_2: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                },
                environment_3: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                }
            }
        },
        group2: {
            service: {
                environment_1: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                },
                environment_2: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                },
                environment_3: {
                    manual_state: true,
                    auto_state: true,
                    tickets: ['ticket 1', 'ticket 2']
                }
            }
        }
    }
};

const devToolsExtension = window.devToolsExtension ? window.devToolsExtension() : f => f;

export const createGatekeeperStore = () => createStore(reducer, initialState, compose(applyMiddleware(sse),
devToolsExtension));
