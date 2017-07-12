import React from 'react';
import PropTypes from 'prop-types';
import R from "ramda";
import {Nav, Navbar, NavItem} from "react-bootstrap";

export function HeaderLinks({links}) {
    return (
        <Nav>
            {R.addIndex(R.map)((link, index) => <NavItem key={index} href="#">{link}</NavItem>)(links)}
        </Nav>
    )
}

export class Header extends React.Component {
    render() {
        const {links} = this.props;
        return (
            <Navbar fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                        Gatekeeper
                    </Navbar.Brand>
                    <HeaderLinks links={links}/>
                </Navbar.Header>
            </Navbar>
        );
    }
}

Header.propTypes = {
    links: PropTypes.array.isRequired
};

export default (Header);
