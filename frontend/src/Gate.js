import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {
    Button,
    Label,
    FormGroup,
    FormControl,
    Grid,
    Row,
    Col,
    Glyphicon
} from 'react-bootstrap';
import {removeTicket, setManualState} from './reducers/gates';

export function ManuelState({isOpen, onManualStateClick}) {
    return <Button bsStyle={isOpen ? 'success' : 'danger'} onClick={() => onManualStateClick(!isOpen)}>{isOpen ? 'Open' : 'Closed'}</Button>
}

export function AutoState({isOpen}) {
    return <h4><Label bsStyle={isOpen ? 'success' : 'danger'}>{isOpen ? 'Open' : 'Closed'}</Label></h4>
}

export function Comment({comment}) {
    return (
        <FormGroup controlId='formControlsTextarea'>
            <FormControl componentClass='textarea' placeholder="" value={comment}/>
        </FormGroup>
    );
}

export function Tickets({tickets, onTicketRemoveClick}) {
    return (
        <Grid>
            {tickets.map(ticket => {
                return <Row key={ticket}><Col>{ticket}<a onClick={() => onTicketRemoveClick(ticket)}><Glyphicon glyph='trash'/></a></Col></Row>
            })}
        </Grid>
    );
}

export class Gate extends React.Component {
    render() {
        const {manual_state, auto_state, comment, tickets, onTicketRemoveClick, onManualStateClick} = this.props;
        return (
            <Grid>
                <Row>
                    <Col xs={4} md={2}>
                        <Row>
                            <ManuelState isOpen={manual_state} onManualStateClick={onManualStateClick}/>
                        </Row>
                        <Row>
                            <AutoState isOpen={auto_state}/>
                        </Row>
                    </Col>
                    <Col xs={2} md={4}>
                        <Comment comment={comment}/>
                    </Col>
                </Row>
                <Row>
                    <Col><Tickets tickets={tickets} onTicketRemoveClick={onTicketRemoveClick}/></Col>
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
    last_modified_state: PropTypes.string,
    last_modified_comment: PropTypes.string
};

const defaultValues = {
    group: '',
    service: '',
    environment: '',
    comment: '',
    manual_state: true,
    auto_state: true,
    tickets: [],
    last_modified_state: '',
    last_modified_comment: ''
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group, initialProps.service, initialProps.environment])(state);
    return R.mergeAll([defaultValues, initialProps, gate_from_state]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        onTicketRemoveClick: (id) => {
            dispatch(removeTicket(initialProps.group, initialProps.service, initialProps.environment, id))
        },
        onManualStateClick: (state) => {
            dispatch(setManualState(initialProps.group, initialProps.service, initialProps.environment, state))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Gate);
