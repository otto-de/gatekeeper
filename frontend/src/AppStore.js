import {createStore} from "redux";

const initialState = {
    gates: {}
};

const middleware = window.devToolsExtension ? window.devToolsExtension() : f => f;

export const createGatekeeperStore = () => createStore((oldState = {}, action) => {return oldState}, initialState, middleware);