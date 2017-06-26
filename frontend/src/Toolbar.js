import React from 'react';
import {connect} from 'react-redux';
import {ButtonToolbar, Button} from 'react-bootstrap';
import {openEditServiceDialog} from './reducers/dialog';

export class Toolbar extends React.Component {
    render() {
        const {openEditGateDialog} = this.props;
        return (
            <ButtonToolbar style={{margin: '5px'}}>
                <Button bsStyle="info" onClick={() => openEditGateDialog()}>Add Gate</Button>
                <Button bsStyle="info">Edit Holidays</Button>
            </ButtonToolbar>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        openEditGateDialog: () => {
            dispatch(openEditServiceDialog('', '', true));
        }
    };
};

export default connect(() => {return {}}, mapDispatchToProps)(Toolbar);
