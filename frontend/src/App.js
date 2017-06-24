import React, {Component} from 'react';
import {connect} from 'react-redux';
import GroupNavigation from './GroupNavigation';
import Header from './Header';
import './App.css';

export class App extends Component {
    render() {
        const links = ['Gates'];
        return (
            <div>
                <Header links={links}/>
                <GroupNavigation/>
            </div>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(App);
