import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from './Header';

export class About extends Component {
    render() {
        console.log(this.props);
        return (
            <div>
                <div>This site is about stuff.</div>
            </div>
        );
    }
}

const mapStateToProps = (state, initialProps) => {
    return {};
};


export default connect(mapStateToProps)(About);
