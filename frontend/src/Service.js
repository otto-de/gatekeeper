import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {Col, Grid, Row, Glyphicon} from 'react-bootstrap';
import {openEditServiceDialog} from './reducers/dialog';
import Gate from './Gate';

export function Gates({group, service, environments}) {
    return (
        <div key={`${group}-${service}`}>
            {R.map((environment) => {
                return (
                    <Col xs={2} md={2} key={`col-${group}-${service}-${environment}`}>
                        <Gate key={`gate-${group}-${service}-${environment}`}
                              group={group}
                              service={service}
                              environment={environment}/>
                    </Col>
                );
            })(environments)}
        </div>
    );
}

export class Service extends React.Component {
    render() {
        const {group, service, environments, openEditServiceDialog} = this.props;
        return (
            <Grid fluid={true}>
                <Row>
                    <Col xs={1} md={1}>
                        {service}
                        <a className='glyp-button'
                           onClick={() => openEditServiceDialog()}>
                            <Glyphicon glyph='pencil'/>
                        </a>
                    </Col>
                    <Gates group={group} service={service}
                           environments={environments}/>
                </Row>
            </Grid>
        );
    }
}

Service.propTypes = {
    group: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    environments: PropTypes.array
};

const defaultValues = {
    group: '',
    service: '',
    environments: []
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group, initialProps.service])(state);
    const environments = {
        environments: Object.keys(gate_from_state)
    };
    return R.mergeAll([defaultValues, initialProps, environments]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        openEditServiceDialog: () => {
            dispatch(openEditServiceDialog(initialProps.group, initialProps.service));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Service);
