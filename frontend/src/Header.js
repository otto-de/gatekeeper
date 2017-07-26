import React from 'react';
import PropTypes from 'prop-types';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export class Header extends React.Component {
    render() {
        const {location} = this.props;
        return (
            <Navbar fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                        Gatekeeper
                    </Navbar.Brand>
                    <Nav>
                        <NavItem title="Item">
                            <Link to="/">
                                Index
                            </Link>
                        </NavItem>
                        <Navbar.Text>
                            {location}
                        </Navbar.Text>
                    </Nav>
                </Navbar.Header>
            </Navbar>
        );
    }
}

Header.propTypes = {
    location: PropTypes.string.isRequired
};

export default (Header);
