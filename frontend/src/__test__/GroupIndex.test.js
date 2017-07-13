import React from 'react';
import renderer from 'react-test-renderer';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import ConnectedGroupIndex, {GroupIndex} from '../GroupIndex';
// import {Link} from 'react-router-dom';

jest.mock('react-router-dom/Link', () => 'Link');
jest.mock('react-router-dom/NavLink', () => 'NavLink');

describe('GroupIndex component', () => {
    it('render', () => {
        const component = renderer.create(<GroupIndex groups={['group1', 'group2']}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});

describe('load from state', () => {
    it('should load the state correctly', () => {
        const storeMock = MockStore({
            'gates': {
                'ftx': {},
                'fty': {}
            }
        });

        const subject = (
            <Provider store={storeMock}>
                <ConnectedGroupIndex/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
