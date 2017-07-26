import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import R from 'ramda';
import Toolbar from './Toolbar';
import EditGateDialog from './EditServiceDialog';
import Group from './Group';
import Header from "./Header";


export class App extends Component {
    render() {
        const {groups} = this.props;
        const target_group = R.path(['match', 'params', 'groupId'])(this.props) || "";

        let content = null;
        if (groups.length === 0) {
            content = <div><h1>Loading</h1></div>;
        } else if (!groups.includes(target_group)) {
            content = <div><h1>404</h1><h3>The group was not found.</h3></div>;
        } else {
            content = <Group group={target_group}/>
        }

        return (
            <div>
                <Header location={target_group}/>
                <Toolbar/>
                <EditGateDialog/>
                {content}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const gate_from_state = R.path(['gates'])(state);
    return {groups: Object.keys(gate_from_state)};
};


export default connect(mapStateToProps)(App);
