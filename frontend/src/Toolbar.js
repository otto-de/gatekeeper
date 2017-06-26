import React from 'react';
import {ButtonToolbar, Button} from 'react-bootstrap';

export class Toolbar extends React.Component {
    render() {
        return (
            <ButtonToolbar style={{margin: '5px'}}>
                <Button bsStyle="info">Add Gate</Button>
                <Button bsStyle="info">Edit Holidays</Button>
            </ButtonToolbar>
        );
    }
}

Toolbar.propTypes = {};

export default (Toolbar);
