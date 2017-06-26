import React from 'react';
import {Col} from 'react-bootstrap';
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import ConnectedService, {Gates, Service} from '../Service';

jest.mock('../Gate');

describe('Service component', () => {
    it('render', () => {
        const component = renderer.create(<Service group='group'
                                                   service='service'
                                                   environments={['environment1', 'environment2', 'environment3']}
                                                   openEditServiceDialog='openEditServiceDialog'
                                                   setService='setService'/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('should contain gates for every environment', () => {
        const component = shallow(<Gates group='group'
                                         service='service'
                                         environments={['environment1', 'environment2', 'environment3']}/>);
        expect(component.find(Col).length).toEqual(3);
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
                }
            }
        });

        const subject = (
            <Provider store={storeMock}>
                <ConnectedService group='ftx' service='gatekeeper'/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});