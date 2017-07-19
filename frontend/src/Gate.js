import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {
    Button,
    Popover,
    OverlayTrigger,
    Grid,
    Row,
    Col,
    Glyphicon,
    Well
} from 'react-bootstrap';
import {setManualState, setCommentEditDialog} from './reducers/gates';
import {deleteTicketRequest} from './enhancers/api';
import CommentDialog from './CommentDialog';
import './Gate.css';

const manualStatePopover = (
    <Popover id="manualStatePopover" title='Manuel State'>
        "Close or open the gate manually. This state is persistent."
    </Popover>
);

export function ManuelState({isOpen, onManualStateClick}) {
    return (
        <OverlayTrigger placement="bottom" overlay={manualStatePopover}>
            <Button bsStyle={isOpen ? 'success' : 'danger'} onClick={() => onManualStateClick(!isOpen)}>
                {isOpen ? 'Open' : 'Closed'}
            </Button>
        </OverlayTrigger>
    );
}

export function LastModified({isOpen, last_modified}) {
    return isOpen ? null : <div className='default-comment'>{last_modified}</div>;
}

const autoStatePopover = (
    <Popover id="autoStatePopover" title='Automatic gate'>
        "Will be temporally closed if tickets are present, on holidays or outside of business hours."
    </Popover>
);

export function AutoState({isOpen}) {
    return (
        <OverlayTrigger placement="bottom" overlay={autoStatePopover}>
            <div className='auto-state-button-div'>
                <Button className='auto-state-button' disabled bsStyle={isOpen ? 'success' : 'danger'}>
                    {isOpen ? 'Open' : 'Closed'}
                </Button>
            </div>
        </OverlayTrigger>
    );
}

export function GateArrow({gate_state}) {
    return <Glyphicon className={gate_state ? 'text-danger' : 'text-success'} glyph='chevron-right'/>;
}

export function GateButton() {

}

export function Comment({comment, openCommentEditDialog}) {
    return (
        <div className={`comment ${comment ? '' : 'default-comment'}`}>
            {comment ? comment : 'comment'}
            <a className='glyp-button'
               onClick={() => openCommentEditDialog()}>
                <Glyphicon glyph='pencil'/>
            </a>
        </div>
    );
}

export function Tickets({tickets, onTicketRemoveClick}) {
    return (
        <Grid>
            {tickets.map(ticket => {
                return (
                    <Row key={ticket}>
                        <Col>
                            {ticket}
                            <a className='glyp-button'
                               onClick={() => onTicketRemoveClick(ticket)}>
                                <Glyphicon glyph='trash'/>
                            </a>
                        </Col>
                    </Row>
                );
            })}
        </Grid>
    );
}

export class Gate extends React.Component {
    render() {
        const {manual_state, auto_state, message, queue, last_modified, onTicketRemoveClick, onManualStateClick, openCommentEditDialog} = this.props;
        const gate_state = !manual_state & auto_state;
        return (
            <Well className="gate" bsSize="small">
                <div>
                    <GateArrow gate_state={gate_state}/>
                    <ManuelState isOpen={manual_state} onManualStateClick={onManualStateClick}/>
                    <GateArrow gate_state={gate_state}/>
                    <AutoState isOpen={auto_state}/>
                    <GateArrow gate_state={gate_state}/>
                </div>
                <LastModified isOpen={manual_state} last_modified={last_modified}/>
                <div>
                    <CommentDialog group={this.props.group}
                                   service={this.props.service}
                                   environment={this.props.environment}
                                   comment={message}/>

                    <Comment comment={message} openCommentEditDialog={openCommentEditDialog}/>
                </div>
                <Tickets tickets={queue} onTicketRemoveClick={onTicketRemoveClick}/>
            </Well>
        );
    }
}

Gate.propTypes = {
    group: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    message: PropTypes.string,
    manual_state: PropTypes.bool,
    auto_state: PropTypes.bool,
    queue: PropTypes.array,
    last_modified: PropTypes.string
};

const defaultValues = {
    group: '',
    service: '',
    environment: '',
    message: '',
    manual_state: true,
    auto_state: true,
    queue: [],
    last_modified: 'now'
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group, initialProps.service, initialProps.environment])(state);
    return R.mergeAll([defaultValues, initialProps, gate_from_state]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        onTicketRemoveClick: (id) => {
            dispatch(deleteTicketRequest(initialProps.group, initialProps.service, initialProps.environment, id));
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
