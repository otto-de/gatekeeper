import React, {Component} from 'react';
import {connect} from 'react-redux';
import GroupNavigation from './GroupNavigation';
import './App.css';

export class App extends Component {
    render() {
        return (
            <GroupNavigation/>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
