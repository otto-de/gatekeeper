import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import R from 'ramda';
import Toolbar from './Toolbar';
import EditServiceDialog from './EditServiceDialog';
import Header from './Header';


export class GroupIndex extends React.Component {
    render() {
        const {groups} = this.props;
        return (
            <div>
                <Header location=""/>
                <Toolbar/>
                <EditServiceDialog/>
                {R.map((group) => {
                    return (
                        <Link key={`group-link-${group}`} to={`/group/${group}`}>
                            <h4>{group}</h4>
                        </Link>
                    )
                })(groups)}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const gate_from_state = R.path(['gates'])(state);
    return {groups: Object.keys(gate_from_state)};
};


export default connect(mapStateToProps)(GroupIndex);
