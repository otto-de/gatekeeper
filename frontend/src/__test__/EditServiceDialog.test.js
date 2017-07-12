import React from 'react';
import renderer from 'react-test-renderer';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import {Modal} from 'react-bootstrap';
import {shallow, mount} from 'enzyme';
import ConnectedEditServiceDialog, {EditServiceDialog, ServiceForm}  from '../EditServiceDialog';

jest.mock('../FormInputField', () => 'FormInputField');

describe('EditServiceDialog', () => {
    it('renders', () => {
        const wrapper = shallow(<EditServiceDialog service='service'
                                                   group='group'
                                                   environments='env1, env2, env3'
                                                   show={true}
                                                   setService='setService'
                                                   closeEditServiceDialog='closeEditServiceDialog'/>);
        expect(wrapper.find(Modal).length).toEqual(1);
    });

    it('dialog is open', () => {
        const wrapper = shallow(<EditServiceDialog service='service'
                                                   group='group'
                                                   environments='env1, env2, env3'
                                                   show={true}
                                                   setService='setService'
                                                   closeEditServiceDialog='closeEditServiceDialog'/>);
        expect(wrapper.find(Modal).prop('show')).toEqual(true);
    });

    it('contact form should render form corretly', () => {
        const component = renderer.create(<ServiceForm comment='comment 1'/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

});

describe('load from state', () => {
    it('should load the state correctly', () => {
        jest.resetModules();
        const storeMock = MockStore({
            dialog: {
                editService: {
                    group: 'ftX',
                    service: 'gatekeeper',
                    show: true
                }
            }
        });

        const subject = mount(
            <Provider store={storeMock}>
                <ConnectedEditServiceDialog/>
            </Provider>);
        expect(subject.find(Modal).prop('show')).toEqual(true);
    });
});