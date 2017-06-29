import React from 'react';
import FormInputField  from '../FormInputField';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';
import {MockStore} from './mockStore';
import {Provider} from 'react-redux';
import {Field} from 'redux-form';
import {reduxForm} from 'redux-form';

jest.mock('redux-form/immutable', () => ({
    Field: 'Field',
    reduxForm: (redux_form_configuration) => (wrapped_form_component) => wrapped_form_component
}));

describe('FormInputField component', () => {
    it('should contain all components', () => {
        const Decorated = reduxForm({form: 'testForm'})(
            FormInputField
        );
        const storeMock = MockStore({});
        const component = renderer.create(
            <Provider store={storeMock}>
                <Decorated name='someInputField'
                           label='someLabel'
                           inputProps={{
                               type: 'text',
                               component: 'input'
                           }}
                           placeholder='somePlaceholder'/>
            </Provider>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
