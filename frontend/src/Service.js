import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {Col, Grid, Row, Glyphicon} from 'react-bootstrap';
import {openEditServiceDialog} from './reducers/dialog';
import Gate from './Gate';

export function Gates({environment_order, group, service, environments}) {
    return (
        <div key={`col-${group}-${service}`}>
            {R.map((group_environment) => {
                if (environments && environments.includes(group_environment)) {
                    return (
                        <Col xs={2} md={2} key={`col-${group}-${service}-${group_environment}`}>
                            <Gate key={`gate-${group}-${service}-${group_environment}`}
                                  group={group}
                                  service={service}
                                  environment={group_environment}/>
                        </Col>);
                } else {
                    return <Col xs={2} md={2} key={`col-${group}-${service}-${group_environment}`}/>;
                }
            })(environment_order)}
        </div>
    );
}

export class Service extends React.Component {
    render() {
        const {group, service, environments, environment_order, openEditServiceDialog} = this.props;
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
                    <Gates environment_order={environment_order} group={group} service={service}
                           environments={environments}/>
                </Row>
            </Grid>
        );
    }
}

Service.propTypes = {
    group: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    environment_order: PropTypes.array.isRequired,
    environments: PropTypes.array,
};

const defaultValues = {
    group: '',
    service: '',
    environment_order: [],
    environments: [],
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
