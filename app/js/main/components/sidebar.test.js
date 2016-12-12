import React from 'react';
import { mount } from 'enzyme';
import store from '../test-helper';

import Sidebar from './sidebar';

function setup(isOpen) {
    const props = {
        store: store,
        isOpen: isOpen
    };

    const enzymeWrapper = mount(<Sidebar {...props}/>);

    return {
        props,
        enzymeWrapper
    };
}

describe('Sidebar component', () => {
    it('Should have a div with only class: sidebar', () => {
        const { enzymeWrapper} = setup(false);

        const actual = enzymeWrapper.find('div.sidebar').hasClass('open');

        expect(actual).toBe(false);
    });

    it.skip('Should have a div with classes: sidebar open', () => {
        const { enzymeWrapper} = setup(true);

        const actual = enzymeWrapper.find('div.sidebar.open').length;

        expect(actual).toBe(1);
    });
});
