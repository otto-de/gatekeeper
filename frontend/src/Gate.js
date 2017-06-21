import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {
    Button,
    Label,
    Grid,
    Row,
    Col,
    Glyphicon,
    Panel
} from 'react-bootstrap';
import {removeTicket, setManualState, setCommentEditDialog} from './reducers/gates';
import CommentDialog from './CommentDialog';

export function ManuelState({isOpen, onManualStateClick}) {
    return <Button bsStyle={isOpen ? 'success' : 'danger'}
                   onClick={() => onManualStateClick(!isOpen)}>{isOpen ? 'Open' : 'Closed'}</Button>;
}

export function LastModified({last_modified}) {
    return <div>{last_modified}</div>;
}

export function AutoState({isOpen}) {
    return <h4><Label bsStyle={isOpen ? 'success' : 'danger'}>{isOpen ? 'Open' : 'Closed'}</Label></h4>;
}

export function Comment({openCommentEditDialog, comment}) {
    return (
        <Panel onClick={openCommentEditDialog}>
            {comment}
        </Panel>
    );
}


export function EditComment({openCommentEditDialog}) {
    return <Button bsStyle='info' bsSize='xsmall'
                   onClick={() => openCommentEditDialog()}>edit comment</Button>;
}

export function Tickets({tickets, onTicketRemoveClick}) {
    return (
        <Grid>
            {tickets.map(ticket => {
                return <Row key={ticket}><Col>{ticket}<a onClick={() => onTicketRemoveClick(ticket)}><Glyphicon
                    glyph='trash'/></a></Col></Row>;
            })}
        </Grid>
    );
}

export class Gate extends React.Component {
    render() {
        const {manual_state, auto_state, comment, tickets, last_modified, onTicketRemoveClick, onManualStateClick, openCommentEditDialog, handleSubmit} = this.props;
        return (
            <Grid>
                <Row>
                    <Col xs={2} md={2}>
                        <Row>
                            <ManuelState isOpen={manual_state} onManualStateClick={onManualStateClick}/>
                        </Row>
                        <Row>
                            <LastModified last_modified={last_modified}/>
                        </Row>
                        <Row>
                            <AutoState isOpen={auto_state}/>
                        </Row>
                    </Col>
                    <Col xs={10} md={10}>
                        <Row>
                            <CommentDialog group={this.props.group}
                                           service={this.props.service}
                                           environment={this.props.environment}
                                           comment={comment}/>
                            <Comment openCommentEditDialog={openCommentEditDialog} comment={comment}/>
                        </Row>
                        <Row>
                            <EditComment openCommentEditDialog={openCommentEditDialog}/>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Tickets tickets={tickets} onTicketRemoveClick={onTicketRemoveClick}/>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

Gate.propTypes = {
    group: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    comment: PropTypes.string,
    manual_state: PropTypes.bool,
    auto_state: PropTypes.bool,
    tickets: PropTypes.array,
    last_modified: PropTypes.string
};

const defaultValues = {
    group: '',
    service: '',
    environment: '',
    comment: '',
    manual_state: true,
    auto_state: true,
    tickets: [],
    last_modified: 'now'
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group, initialProps.service, initialProps.environment])(state);
    return R.mergeAll([defaultValues, initialProps, gate_from_state]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        onTicketRemoveClick: (id) => {
            dispatch(removeTicket(initialProps.group, initialProps.service, initialProps.environment, id));
        },
        onManualStateClick: (state) => {
            dispatch(setManualState(initialProps.group, initialProps.service, initialProps.environment, state));
        },
        openCommentEditDialog: () => {
            dispatch(setCommentEditDialog(initialProps.group, initialProps.service, initialProps.environment, true));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Gate);
