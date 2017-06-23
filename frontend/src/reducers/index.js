import { combineReducers } from 'redux'
import gates from './gates'
import tabs from './tabs'
import { reducer as formReducer } from 'redux-form'

export default combineReducers({
    gates,
    form: formReducer,
    tabs
})