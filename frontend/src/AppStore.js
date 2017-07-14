import {createStore, applyMiddleware, compose} from 'redux';
import {routerMiddleware} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import reducer from './reducers';
import sse from './enhancers/sse';
import api from './enhancers/api';

const initialState = {
    dialog: {},
    gates: {},
};
export const history = createHistory();
const router = routerMiddleware(history);

const devToolsExtension = window.devToolsExtension ? window.devToolsExtension() : f => f;

export const createGatekeeperStore = () => createStore(reducer, initialState, compose(applyMiddleware(sse, api, router),
    devToolsExtension));
