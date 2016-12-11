import React from 'react';
import { mount } from 'enzyme';
import store from '../test-helper';
import sinon from 'sinon';

import Header from './header';

const PAGE_NAME = 'test';

function setup() {
    const props = {
        store: store,
        pageName: PAGE_NAME,
        toggleSidebar: sinon.spy()
    };

    const enzymeWrapper = mount(<Header {...props}/>);

    return {
        props,
        enzymeWrapper
    };
}

describe('Header component', () => {
    describe('button with hamburger-menu class', () => {
        it.skip('Should invoke toggleSidebar when clicked', () => {
            const { enzymeWrapper, props } = setup();

            enzymeWrapper.find('button.hamburger-menu').simulate('click');

            expect(props.toggleSidebar.calledOnce).toBe(1);
        });
    });

    it(`Should have a span element with text: ${PAGE_NAME}`, () => {
        const { enzymeWrapper } = setup();

        const actual = enzymeWrapper.find('.page-name').text();

        expect(actual).toBe(PAGE_NAME);
    });
});