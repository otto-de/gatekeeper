import React from 'react';
import renderer from 'react-test-renderer';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import {Modal} from 'react-bootstrap';
import {shallow, mount} from 'enzyme';
import ConnectedEditServiceDialog, {EditServiceDialog, ServiceForm, mapDispatchToProps}  from '../EditServiceDialog';

jest.mock('../FormInputField', () => 'FormInputField');

const SET_EDIT_SERVICE_DIALOG = 'gatekeeper/dialog/edit_service_dialog/SET';
const CREATE_OR_UPDATE_SERVICE_REQUEST = 'gatekeeper/api/service/CREATE';

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

describe('should dispatch the right actions', () => {

    const dispatchMock = jest.fn();
    const subject = mapDispatchToProps(dispatchMock, {});
    const closeDialogAction = {
        "dialog": "editService",
        "group": "",
        "service": "",
        "show": false,
        "type": SET_EDIT_SERVICE_DIALOG
    };

    beforeEach(() => {
        dispatchMock.mockReset();
    });

    it('closeEditServiceDialog', () => {
        subject.closeEditServiceDialog();
        expect(dispatchMock).toBeCalledWith(closeDialogAction);
    });

    it('setService', () => {
        subject.setService({group: 'group', name: 'name', environments: ' env1, env2'});
        expect(dispatchMock.mock.calls[0][0]).toEqual(
            {
                "environments": ["env1", "env2"],
                "group": "group",
                "service": "name",
                "type": CREATE_OR_UPDATE_SERVICE_REQUEST
            });
        expect(dispatchMock.mock.calls[1][0]).toEqual(closeDialogAction);
    });


    it('deleteService', () => {
        subject.deleteService({group: 'group', name: 'name', environments: ' env1, env2'});
        expect(dispatchMock.mock.calls[0][0]).toEqual(
            {
                "group": {
                    "environments": " env1, env2",
                    "group": "group",
                    "name": "name"
                }, "service": undefined, "type": "gatekeeper/api/service/DELETE"
            }
        );
        expect(dispatchMock.mock.calls[1][0]).toEqual(closeDialogAction);
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