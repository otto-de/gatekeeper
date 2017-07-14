import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Button, Modal} from 'react-bootstrap';
import {closeEditServiceDialog} from './reducers/dialog';
import {deleteServiceRequest, createOrUpdateServiceRequest} from './enhancers/api';
import FormInputField from './FormInputField';

export const ServiceForm = props => {
    // handleSubmit comes from redux-form and must be passed to form
    const {handleSubmit, deleteService} = props;
    return (
        <form onSubmit={ handleSubmit }>
            <FormInputField label="Name"
                            name="name"
                            autoFocus={true}/>
            <FormInputField label="Group"
                            name="group"/>
            <FormInputField label="Environments"
                            name="environments"
                            placeholder="Env1, Env2, Env3"/>
            <Button bsStyle="danger" onClick={deleteService}>Delete</Button>
            <div style={{float: 'right'}}>
                <Button bsStyle="success" type="submit">Save</Button>
            </div>
        </form>
    );
};

const ConnectedServiceForm = reduxForm({
    form: 'editGate'
})(ServiceForm);

export class EditServiceDialog extends React.Component {
    render() {
        const {service, group, environments, show, setService, deleteService, closeEditServiceDialog} = this.props;
        return (
            <Modal show={show} onHide={() => closeEditServiceDialog()}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Service</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {<ConnectedServiceForm onSubmit={setService}
                                           deleteService={() => deleteService(group, service)}
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

export const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        closeEditServiceDialog: () => {
            dispatch(closeEditServiceDialog());
        },
        setService: ({group, name, environments}) => {
            let trimmedFormValue = (environments || '').trim();
            if (trimmedFormValue === '') {
                return;
            }
            dispatch(createOrUpdateServiceRequest(group, name, trimmedFormValue.split(',').map(str => str.trim())));
            dispatch(closeEditServiceDialog());
        },
        deleteService: (group, service) => {
            dispatch(deleteServiceRequest(group, service));
            dispatch(closeEditServiceDialog());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditServiceDialog);
