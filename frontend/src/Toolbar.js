import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {ButtonToolbar, Button, Modal} from 'react-bootstrap';
import {FormInputField} from './FormInputField';

export class Toolbar extends React.Component {
    render() {
        return (
            <ButtonToolbar style={{margin: '5px'}}>
                <Button bsStyle="info">Add Gate</Button>
                <Button bsStyle="info">Edit Holidays</Button>
            </ButtonToolbar>
        );
    }
}

Toolbar.propTypes = {};

export default (Toolbar);
