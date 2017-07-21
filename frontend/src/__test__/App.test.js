import React from 'react';
import renderer from 'react-test-renderer';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import ConnectedApp, {App} from '../App';

jest.mock('../Header', () => 'Header');
jest.mock('../Toolbar', () => 'Toolbar');
jest.mock('../EditServiceDialog', () => 'EditServiceDialog');
jest.mock('../Group', () => 'Group');

describe('App component', () => {
    it('render without groupId', () => {
        const component = renderer.create(<App groups={['group1', 'group2']}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('render without state', () => {
        const component = renderer.create(<App groups={[]}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('render group1', () => {
        const component = renderer.create(<App groups={['group1', 'group2']}
                                               match={{params: {groupId: 'group1'}}}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('render with non existing group', () => {
        const component = renderer.create(<App groups={['group1', 'group2']}
                                               match={{params: {groupId: 'some_group'}}}/>);
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
                <ConnectedApp match={{params: {groupId: 'ftx'}}}/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
