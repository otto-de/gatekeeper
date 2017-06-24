import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';
import {Header} from '../Header';

jest.mock('../Gate');

describe('Header component', () => {
    it('render', () => {
        const component = renderer.create(<Header links={['link1', 'link2', 'link3']}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should contain all links', () => {
        const component = mount(<Header links={['link1', 'link2', 'link3']}/>);
        expect(component.find('NavItem').length).toEqual(3);
    });

});
