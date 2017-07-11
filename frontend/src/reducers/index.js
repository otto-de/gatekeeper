import { combineReducers } from 'redux';
import gates from './gates';
import tabs from './tabs';
import dialog from './dialog';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
    gates,
    tabs,
    dialog,
    form: formReducer
})