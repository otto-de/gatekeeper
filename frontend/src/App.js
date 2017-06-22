import React, {Component} from 'react';
import {connect} from 'react-redux';
import Group from './Group';
import './App.css';

export class App extends Component {
    render() {
        return (
            <Group group="group"/>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
