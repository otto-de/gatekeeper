import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import Service from './Service';

export function Services({group, services}) {
    console.log(services)
    return (
        <div key={`${group}`}>
            {R.map((service) => {
                return (
                    <div key={`service-${group}-${service}`} style={{marginBottom: '20px'}}>
                        <Service
                            group={group}
                            service={service}/>
                    </div>
                );
            })(services)}
        </div>
    );
}

export class Group extends React.Component {
    render() {
        const {group, services} = this.props;
        return (
            <Services group={group} services={services}/>
        );
    }
}

Group.propTypes = {
    group: PropTypes.string.isRequired,
    services: PropTypes.array
};

const defaultValues = {
    group: '',
    service: []
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates', initialProps.group])(state);
    console.log("yada:"+gate_from_state)
    const services = {
        services: Object.keys(gate_from_state)
    };
    return R.mergeAll([defaultValues, initialProps, services]);
};

export default connect(mapStateToProps)(Group);
