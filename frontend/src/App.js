import React, {Component} from 'react';
import {connect} from 'react-redux';
import Service from './Service';
import './App.css';

export class App extends Component {
    render() {
        return (
            <Service group="group" service="service"/>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
