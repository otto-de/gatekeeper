import React, {Component} from 'react';
import {connect} from 'react-redux';
import Group from './Group';
import './App.css';
import Toolbar from './Toolbar';
import EditGateDialog from './EditServiceDialog';
import R from 'ramda';


export class App extends Component {
    render() {
        const {groups} = this.props;
        const target_group = this.props.match.params.groupId;

        let text;
        let content = true;
        if (groups.length === 0) {
            text = 'Loading';
            content = false;
        } else if (!groups.includes(target_group)) {
            text = '404';
            content = false;
        }
        return (
            <div>
                <Toolbar/>
                <EditGateDialog/>
                {content ? <Group group={target_group}/> : <div>{text}</div>}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const gate_from_state = R.path(['gates'])(state);
    return {groups: Object.keys(gate_from_state)};
};


export default connect(mapStateToProps)(App);
