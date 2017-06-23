import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import ConnectedGroupNavigation, {GroupNavigation} from '../GroupNavigation';

jest.mock('../Group', () => 'Group');

describe('GroupNavigation component', () => {
    it('render', () => {
        const component = renderer.create(<GroupNavigation groups={['group1', 'group2']} active_group={0}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should contain a tab for every group', () => {
        const component = shallow(<GroupNavigation groups={['group1', 'group2']} active_group={0}/>);
        expect(component.find('Tab').length).toEqual(2);
    });
});

describe('load from state', () => {
    it('should load the state correctly', () => {
        const storeMock = MockStore({
            'tabs': {
                active_tab: 0
            },
            'gates': {
                'ftx': {},
                'fty': {}
            }
        });

        const subject = (
            <Provider store={storeMock}>
                <ConnectedGroupNavigation/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
