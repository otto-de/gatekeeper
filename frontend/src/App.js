import React, {Component} from 'react';
import {connect} from 'react-redux';
import Gate from './Gate';
import './App.css';

class App extends Component {
    render() {
        return (
            <Gate group="wow" service="such" comment="dog" environment="asd"/>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
