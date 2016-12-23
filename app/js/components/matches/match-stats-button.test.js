import React from 'react';
import { mount } from 'enzyme';
import store from '../../test-helper';
import  sinon  from 'sinon';

import { MatchStatsButton } from './match-stats-button';

function setUp(withMatchStat) {
    const props = {
        matchResults: withMatchStat ? {} : null,
        toggleMatchStats: sinon.spy(),
        matchId: 1
    };

    const wrapper = mount(<MatchStatsButton {...props}/>);

    return {
        enzymeWrapper: wrapper,
        props: props
    };
}

describe('MatchStatsButton', () => {
    it('should have a button HTMLElement with classes: \'stats-toggler loaded\'', () => {
        const { enzymeWrapper } = setUp(true);

        const actual = enzymeWrapper.find('.stats-toggler.loaded').length

        expect(actual).toBe(1);
    });

    it('should have a button HTMLElement with classes: \'stats-toggler loading\'', () => {
        const { enzymeWrapper } = setUp();

        const actual = enzymeWrapper.find('.stats-toggler.loading').length

        expect(actual).toBe(1);
    });

    it('should call passed in function when clicked', () => {
        const { enzymeWrapper, props } = setUp();

        enzymeWrapper.simulate('click');

        expect(props.toggleMatchStats.calledOnce).toBe(true);
    });
});
