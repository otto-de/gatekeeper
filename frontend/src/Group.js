import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {Col, Grid, Row} from 'react-bootstrap';
import Service from './Service';

export function Services({group, services, environment_order}) {
    return (
        <div key={`${group}`}>
            {R.map((service) => {
                return (
                    <div key={`service-${group}-${service}`} style={{marginBottom: '20px'}}>
                        <Service
                            group={group}
                            service={service}
                            environment_order={environment_order}/>
                    </div>
                );
            })(services)}
        </div>
    );
}

export function EnvironmentHeadlines({group, environments}) {
    return (
        <Grid fluid={true}>
            <Row>
                <Col xs={1} md={1}>
                    &nbsp;
                </Col>
                {R.map((environment) =>
                    <Col key={`${group}-headline-${environment}`}
                         xs={2} md={2}>
                        {environment}
                    </Col>
                )(environments)}
            </Row>
        </Grid>
    );
}

export class Group extends React.Component {
    render() {
        const {group, services, environments} = this.props;
        return (
            <div>
                <EnvironmentHeadlines group={group} environments={environments}/>
                <Services group={group} services={services} environment_order={environments}/>
            </div>
        );
    }
}

Group.propTypes = {
    group: PropTypes.string.isRequired,
    services: PropTypes.array,
    environments: PropTypes.array
};

const defaultValues = {
    group: '',
    service: [],
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group])(state);
    const services = Object.keys(gate_from_state);
    const environments = [...new Set(R.flatten(R.map((service) => {
        return Object.keys(gate_from_state[service]);
    })(services)))].sort();
    const info = {
        services: services,
        environments: environments
    };
    return R.mergeAll([defaultValues, initialProps, info]);
};

export default connect(mapStateToProps)(Group);
