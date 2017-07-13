import React, {Component} from 'react';
import {connect} from 'react-redux';
import Group from './Group';
import './App.css';
import Toolbar from './Toolbar';
import EditGateDialog from './EditServiceDialog';
import {history} from './AppStore';
import R from 'ramda';

export class App extends Component {
    render() {
        const {groups} = this.props;
        const target_group = this.props.match.params.groupId;
        if (!groups.includes(target_group)) {
            history.push('/');
            return null;
        }
        return (
            <div>
                <Toolbar/>
                <EditGateDialog/>
                <Group group={target_group}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const gate_from_state = R.path(['gates'])(state);
    return {groups: Object.keys(gate_from_state)};
};


export default connect(mapStateToProps)(App);
