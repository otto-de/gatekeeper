import React from 'react';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import ConnectedGroup, {Group, Services} from '../Group';
import Service from '../Service';

jest.mock('../Service');

describe('Group component', () => {
    it('render', () => {
        const component = renderer.create(<Group group='group'
                                                 services={['service1', 'service2', 'service3']}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should contain all services', () => {
        const component = shallow(<Services group='group'
                                            services={['service1', 'service2', 'service3']}/>);
        expect(component.find(Service).length).toEqual(3);
    });

});

describe('load from state', () => {
    it('should load the state correctly', () => {
        const storeMock = MockStore({
            'gates': {
                'ftx': {
                    'gatekeeper': {
                        'test1': {},
                        'test2': {}
                    }
                },
                'fty': {
                    'gatekeeper2': {
                        'test1': {},
                        'test2': {}
                    }
                }
            }
        });

        const subject = (
            <Provider store={storeMock}>
                <ConnectedGroup group='ftx'/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});