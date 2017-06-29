import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import {Button, Modal} from 'react-bootstrap';
import {setCommentEditDialog, setComment} from './reducers/gates';
import FormInputField from './FormInputField';

export class CommentForm extends React.Component {
    render() {
        // handleSubmit comes from redux-form and must be passed to form
        const {handleSubmit, closeCommentEditDialog} = this.props;
        return (
            <form onSubmit={ handleSubmit }>
                <h4>Edit Comment</h4>
                <FormInputField name="comment"
                                inputProps={{type: 'text', component: 'input', autoFocus: true}}
                                placeholder="enter comment"/>
                <Button bsStyle="success" type="submit">Save</Button>
                <Button onClick={() => closeCommentEditDialog()}>Close</Button>
            </form>
        );
    }
}

const ConnectedCommentForm = reduxForm({
    form: 'comment'
})(CommentForm);

export class CommentDialog extends React.Component {
    render() {
        const {comment, show_comment_edit_dialog, closeCommentEditDialog, setComment} = this.props;
        return (
            <Modal show={show_comment_edit_dialog} onHide={() => closeCommentEditDialog()}>
                <Modal.Body>
                    {<ConnectedCommentForm onSubmit={setComment}
                                           closeCommentEditDialog={closeCommentEditDialog}
                                           initialValues={{comment: comment}}/>}
                </Modal.Body>
            </Modal>
        );
    }
}

CommentDialog.propTypes = {
    group: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    comment: PropTypes.string,
    show_comment_edit_dialog: PropTypes.bool,
};

const defaultValues = {
    group: '',
    service: '',
    environment: '',
    comment: '',
    show_comment_edit_dialog: false
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group, initialProps.service, initialProps.environment])(state);
    return R.mergeAll([defaultValues, initialProps, gate_from_state]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        closeCommentEditDialog: () => {
            dispatch(setCommentEditDialog(initialProps.group, initialProps.service, initialProps.environment, false));
        },
        setComment: (input) => {
            dispatch(setComment(initialProps.group, initialProps.service, initialProps.environment, input.comment));
            dispatch(setCommentEditDialog(initialProps.group, initialProps.service, initialProps.environment, false));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentDialog);
