import React, {Component} from 'react';
import {connect} from 'react-redux';
import Gate from './Gate';
import './App.css';

export class App extends Component {
    render() {
        return (
            <Gate group="group" service="service" environment="environment"/>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
