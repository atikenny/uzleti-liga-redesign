import React from 'react';
import { mount } from 'enzyme';
import store from '../../test-helper';

import { MatchLocation } from './match-location';

function setup() {
    const location = {
        link: 'some link',
        name: 'some name'
    }

    const props = {
        store: store,
        location: location
    };

    const enzymeWrapper = mount(<MatchLocation {...props}/>);

    return {
        props,
        enzymeWrapper
    };
}

describe('MatchLocation', () => {
    it('should have an a element with href: some link', () => {
        const { enzymeWrapper, props } = setup();

        const actual = enzymeWrapper.find('.location').prop('href');
        
        expect(actual).toBe(props.location.link);
    });

    it('should have a span element with text: some name', () => {
        const { enzymeWrapper, props } = setup();

        const actual = enzymeWrapper.find('span').text();
        
        expect(actual).toBe(props.location.name);
    });
});
