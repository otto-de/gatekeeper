import React from 'react';
import renderer from 'react-test-renderer';
import {Header} from '../Header';

jest.mock('react-router-dom/Link', () => 'Link');
jest.mock('react-router-dom/NavLink', () => 'NavLink');

describe('Header component', () => {
    it('render', () => {
        const component = renderer.create(<Header location="group"/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
