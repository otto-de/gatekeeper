import React from 'react';
import {Field} from 'redux-form';
import {FormGroup, ControlLabel, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class FormInputField extends React.Component {
    render() {
        let {name, label, placeholder, labelProps, inputColProps, inputProps} = this.props;
        placeholder = placeholder || label;

        return (
            <FormGroup controlId={name}>
                <Col componentClass={ControlLabel} {...(labelProps || {})} >
                    {label}
                </Col>
                <Col {...(inputColProps || {})}>
                    <Field className="form-control" id={name} name={name} {...(inputProps || {})}
                           placeholder={placeholder}>
                        {this.props.children}
                    </Field>
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
    inputColProps: PropTypes.object,
    inputProps: PropTypes.object
};