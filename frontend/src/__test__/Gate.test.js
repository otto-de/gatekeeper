import React from 'react';
import {Gate, ManuelState, AutoState, Comment, Tickets}  from '../Gate';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

describe('Gate component', () => {
    it('should contain all components', () => {
        const component = renderer.create(<Gate group='group'
                                                service='service'
                                                environment='environment'
                                                comment='comment 1'
                                                manual_state={true}
                                                auto_state={true}
                                                tickets={['ticket 1', 'ticket 2']}
                                                last_modified_state='some time ago'
                                                last_modified_comment='a while ago'/>);
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
        expect(component.find('Label').props().bsStyle).toEqual('danger');
    });

    it('the auto gate state should be open', () => {
        const component = mount(<AutoState isOpen={true}/>);
        expect(component.text()).toEqual('Open');
        expect(component.find('Label').props().bsStyle).toEqual('success');
    });

    it('the comment field contains the given comment', () => {
        const component = mount(<Comment comment='some comment'/>);
        expect(component.text()).toEqual('some comment');
    });

    it('all tickets are displayed', () => {
        const component = mount(<Tickets tickets={['ticket 1', 'ticket 2']}/>);
        const tickets = component.find('Row');
        expect(tickets.length).toEqual(2);
        expect(tickets.at(0).text()).toEqual('ticket 1');
        expect(tickets.at(1).text()).toEqual('ticket 2');
    });

});