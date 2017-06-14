import {createStore} from "redux";
import reducer from './reducers'

const initialState = {
    gates: {}
};

const middleware = window.devToolsExtension ? window.devToolsExtension() : f => f;

export const createGatekeeperStore = () => createStore(reducer, initialState, middleware);
