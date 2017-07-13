import React from 'react';
import ReactDOM from 'react-dom';
import GroupIndex from './GroupIndex';
import App from './App';
import About from './About';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Provider} from 'react-redux';
import {createGatekeeperStore} from './AppStore';
import {connect} from './enhancers/sse';
import {ConnectedRouter} from 'react-router-redux';
import {Route} from 'react-router';
import {history} from './AppStore';

const appStore = createGatekeeperStore();
appStore.dispatch(connect('/stream'));

ReactDOM.render(<Provider store={appStore}>
        <ConnectedRouter history={history}>
            <div>
                <Route exact path="/" component={GroupIndex}/>
                <Route path="/group/:groupId" component={App}/>
                <Route path="/about" component={About}/>
            </div>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();

