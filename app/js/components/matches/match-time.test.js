import React from 'react';
import { mount } from 'enzyme';

import { MatchTime } from './match-time';

function setUp() {
    const props = {
        match: {
            matchDetailsLink: 'some link',
            time: '21:05'
        }
    };

    const wrapper = mount(<MatchTime {...props} />);

    return {
        props: props,
        enzymeWrapper: wrapper
    };
}

describe('MatchTime', () => {
    it('should have an a HTMLElement with href: some link', () => {
        const { enzymeWrapper, props } = setUp();

        const actual = enzymeWrapper.find('a').prop('href');

        expect(actual).toBe(props.match.matchDetailsLink);
    });

    it('should have a span HTMLElement with text: 21:05', () => {
        const { enzymeWrapper, props } = setUp();

        const actual = enzymeWrapper.find('span').text();

        expect(actual).toBe(props.match.time);
    });
});
