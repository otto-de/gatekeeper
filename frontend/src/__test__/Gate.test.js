import React from 'react';
import ConnectedGate, {AutoState, Comment, Gate, LastModified, ManuelState, Tickets} from '../Gate';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';

jest.mock('../CommentDialog', () => 'CommentDialog');

describe('Gate component', () => {
    it('should contain all components', () => {
        const component = renderer.create(<Gate group='group'
                                                service='service'
                                                environment='environment'
                                                comment='comment 1'
                                                manual_state={true}
                                                auto_state={true}
                                                tickets={['ticket 1', 'ticket 2']}
                                                last_modified='some time ago'
                                                onTicketRemoveClick={'onTicketRemoveClick'}
                                                onManualStateClick={'onManualStateClick'}
                                                openCommentEditDialog={'openCommentEditDialog'}/>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('the manual gate state should be closed', () => {
        const component = mount(<ManuelState isOpen={false}/>);
        expect(component.text()).toEqual('Closed');
        expect(component.find('Button').props().bsStyle).toEqual('danger');
    });

    it('the manual gate state should be open', () => {
        const component = mount(<ManuelState isOpen={true}/>);
        expect(component.text()).toEqual('Open');
        expect(component.find('Button').props().bsStyle).toEqual('success');
    });

    it('the auto gate state should be closed', () => {
        const component = mount(<AutoState isOpen={false}/>);
        expect(component.text()).toEqual('Closed');
        expect(component.find('Button').props().bsStyle).toEqual('danger');
    });

    it('the auto gate state should be open', () => {
        const component = mount(<AutoState isOpen={true}/>);
        expect(component.text()).toEqual('Open');
        expect(component.find('Button').props().bsStyle).toEqual('success');
    });

    it('the comment field contains the given comment', () => {
        const component = mount(<Comment comment='some comment' openCommentEditDialog={jest.fn()}/>);
        expect(component.text()).toEqual('some comment');
    });

    it('all tickets are displayed', () => {
        const component = mount(<Tickets tickets={['ticket 1', 'ticket 2']}/>);
        const tickets = component.find('Row');
        expect(tickets.length).toEqual(2);
        expect(tickets.at(0).text()).toEqual('ticket 1');
        expect(tickets.at(1).text()).toEqual('ticket 2');
    });

    it('should display last modified', () => {
        const component = mount(<LastModified last_modified='now'/>);
        expect(component.text()).toEqual('now');
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
                            manual_state: false,
                            auto_state: true,
                            tickets: ['ticket 1'],
                            last_modified: 'now'
                        }
                    }
                }
            }
        });

        const subject = (
            <Provider store={storeMock}>
                <ConnectedGate group='ftx' service='gatekeeper' environment="test"/>
            </Provider>);
        const component = renderer.create(subject);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});