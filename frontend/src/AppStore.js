import {createStore, applyMiddleware, compose} from 'redux';
import {routerMiddleware} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import reducer from './reducers';
import sse from './enhancers/sse';
import api from './enhancers/api';

const initialState = {
    dialog: {},
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
export const history = createHistory();
const router = routerMiddleware(history);

const devToolsExtension = window.devToolsExtension ? window.devToolsExtension() : f => f;

export const createGatekeeperStore = () => createStore(reducer, initialState, compose(applyMiddleware(sse, api, router),
    devToolsExtension));
