import React from 'react';
import {Field} from 'redux-form';
import {FormGroup, ControlLabel, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class FormInputField extends React.Component {
    render() {
        let {name, label, placeholder, labelProps, inputColProps, autoFocus} = this.props;
        placeholder = placeholder || label;
        autoFocus = autoFocus || false;

        return (
            <FormGroup controlId={name}>
                <Col componentClass={ControlLabel} {...(labelProps || {})} >
                    {label}
                </Col>
                <Col {...(inputColProps || {})}>
                    <Field id={name}
                           name={name}
                           className='form-control'
                           component='input'
                           type='text'
                           autoFocus={autoFocus}
                           placeholder={placeholder}/>
                </Col>
            </FormGroup>
        );
    }
}

FormInputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    labelProps: PropTypes.object,
    autoFocus: PropTypes.bool,
    inputColProps: PropTypes.object
};
