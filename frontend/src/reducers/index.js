import {combineReducers} from 'redux';
import gates from './gates';
import dialog from './dialog';
import {reducer as formReducer} from 'redux-form';
import {routerReducer} from 'react-router-redux';

export default combineReducers({
    gates,
    dialog,
    form: formReducer,
    router: routerReducer
});