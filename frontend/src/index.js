import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Provider} from 'react-redux';
import {createGatekeeperStore} from './AppStore';
import { connect } from './enhancers/sse'

const appStore = createGatekeeperStore();
appStore.dispatch(connect('/stream'));

ReactDOM.render(<Provider store={appStore}>
    <App />
</Provider>, document.getElementById('root'));
registerServiceWorker();
