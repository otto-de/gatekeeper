import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';
import {connect} from 'react-redux';
import {Tab, Tabs} from 'react-bootstrap';
import Group from './Group';
import {switchTab} from './reducers/tabs';

export class GroupNavigation extends React.Component {
    render() {
        const {active_tab, switch_tab, groups} = this.props;
        return (
            <Tabs activeKey={active_tab} onSelect={switch_tab} id="controlled">
                {R.addIndex(R.map)((group, index) => {
                    return (
                        <Tab key={`${group}-tab`} eventKey={index} title={group}>
                            <Group group={group}/>
                        </Tab>
                    );
                })(groups)}
            </Tabs>
        );
    }
}

GroupNavigation.propTypes = {
    groups: PropTypes.array,
    active_group: PropTypes.number
};

const defaultValues = {
    group: [],
    active_tab: 0,
};

const mapStateToProps = (state, initialProps) => {
    const gate_from_state = R.path(['gates'])(state);
    const tab_from_state = R.path(['tabs'])(state);
    const groups = {
        groups: Object.keys(gate_from_state),
        active_tab: tab_from_state['active_tab']
    };
    return R.mergeAll([defaultValues, initialProps, groups]);
};

const mapDispatchToProps = (dispatch, initialProps) => {
    return {
        switch_tab: (id) => {
            dispatch(switchTab(id));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupNavigation);
