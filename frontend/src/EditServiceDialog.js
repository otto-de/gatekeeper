import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Button, Modal} from 'react-bootstrap';
import {closeEditServiceDialog} from './reducers/dialog';
import FormInputField from './FormInputField';

export const ServiceForm = props => {
    // handleSubmit comes from redux-form and must be passed to form
    const {handleSubmit, closeEditServiceDialog} = props;
    return (
        <form onSubmit={ handleSubmit }>
            <h4>Add Service</h4>
            <FormInputField label="Name"
                            name="name"
                            inputProps={{type: 'text', component: 'input', autoFocus: true}}/>
            <FormInputField label="Group"
                            name="group"
                            inputProps={{type: 'text', component: 'input'}}/>
            <FormInputField label="Environments"
                            name="environments"
                            inputProps={{type: 'text', component: 'input'}}
                            placeholder="Env1, Env2, Env3"/>
            <Button bsStyle="success" type="submit">Save</Button>
            <Button onClick={() => closeEditServiceDialog()}>Close</Button>
        </form>
    );
};

const ConnectedServiceForm = reduxForm({
    form: 'editGate'
})(ServiceForm);

export class EditServiceDialog extends React.Component {
    render() {
        const {service, group, environments, show, setService, closeEditServiceDialog} = this.props;
        return (
            <Modal show={show} onHide={() => closeEditServiceDialog()}>
                <Modal.Body>
                    {<ConnectedServiceForm onSubmit={setService}
                                           closeEditServiceDialog={closeEditServiceDialog}
                                           initialValues={{name: service, group: group, environments: environments}}/>}
                </Modal.Body>
            </Modal>
        );
    }
}

EditServiceDialog.propTypes = {
    group: PropTypes.string,
    service: PropTypes.string,
    environments: PropTypes.string,
    show: PropTypes.bool,
};

const defaultValues = {
    group: '',
    service: '',
    environments: '',
    show: false
};

const mapStateToProps = (state, initialProps) => {
    let service = {};
    const dialog_from_state = R.path(['dialog', 'editService'])(state);
    if (dialog_from_state) {
        const service_from_state = R.path(['gates', dialog_from_state.group, dialog_from_state.service])(state);
        if (service_from_state) {
            service = {
                group: dialog_from_state.group,
                service: dialog_from_state.service,
                environments: Object.keys(service_from_state).join(', ')
            };
        }
    }
    return R.mergeAll([defaultValues, initialProps, dialog_from_state, service]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        closeEditServiceDialog: () => {
            dispatch(closeEditServiceDialog());
        },
        setService: (input) => {
            console.log(input);
            // dispatch(setComment(initialProps.group, initialProps.service, initialProps.environment, input.comment));
            dispatch(closeEditServiceDialog());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditServiceDialog);
