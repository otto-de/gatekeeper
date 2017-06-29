import React from 'react';
import ConnectedCommentDialog, {CommentDialog, CommentForm}  from '../CommentDialog';
import renderer from 'react-test-renderer';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import {Modal, Button} from 'react-bootstrap';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';

jest.mock('../FormInputField', () => 'FormInputField');

describe('CommentDialog', () => {
    it('renders', () => {
        const wrapper = shallow(<CommentDialog group='group'
                                               service='service'
                                               environment='environment'
                                               comment='comment 1'
                                               show_comment_edit_dialog={false}/>);
        expect(wrapper.find(Modal).length).toEqual(1);
    });

    it('dialog is open', () => {
        const wrapper = shallow(<CommentDialog group='group'
                                               service='service'
                                               environment='environment'
                                               comment='comment 1'
                                               show_comment_edit_dialog={true}/>);
        expect(wrapper.find(Modal).prop('show')).toEqual(true);
    });

    it('contact form should render form correctly', () => {
        const component = renderer.create(<CommentForm comment='comment 1'/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('close button', () => {
        const buttonSpy = sinon.spy();
        const component = shallow(<CommentForm closeCommentEditDialog={buttonSpy}/>);
        component.find(Button).at(1).simulate('click');
        expect(buttonSpy.calledOnce).toBeTruthy();
    });
});

describe('load from state', () => {
    it('should load the state correctly', () => {
        const storeMock = MockStore({
            'gates': {
                'ftx': {
                    'gatekeeper': {
                        'test': {
                            group: 'ftx',
                            service: 'gatekeeper',
                            environment: 'test',
                            comment: 'some comment',
                            show_comment_edit_dialog: true
                        }
                    }
                }
            }
        });

        const subject = mount(
            <Provider store={storeMock}>
                <ConnectedCommentDialog group='ftx' service='gatekeeper' environment="test"/>
            </Provider>);
        expect(subject.find(Modal).prop('show')).toEqual(true);
    });
});