import React from 'react';
import { shallow } from 'enzyme';
import store from '../../test-helper';
import sinon  from 'sinon';

import { MatchStatsButton } from './match-stats-button';

const setUp = (hasMatchResults, showStats) => {
    const props = {
        matchId: 1,
        showStats: !!showStats,
        matchResults: hasMatchResults ? {} : null,
        toggleMatchStats: sinon.spy()
    };

    const wrapper = shallow(<MatchStatsButton {...props}/>);

    return {
        enzymeWrapper: wrapper,
        props: props
    };
}

describe('MatchStatsButton', () => {
    it('should have a button HTMLElement with classes: \'stats-toggler loaded\'', () => {
        const { enzymeWrapper } = setUp(true);

        const actual = enzymeWrapper.find('.stats-toggler.loaded').length;

        expect(actual).toBe(1);
    });

    it('should have a button HTMLElement with classes: \'stats-toggler active\'', () => {
        const { enzymeWrapper } = setUp(false);

        const actual = enzymeWrapper.find('.stats-toggler.loading').length;

        expect(actual).toBe(1);
    });

    it('should have active class when showStats is true', () => {
        const showStats = true;
        const { enzymeWrapper } = setUp(null, showStats);

        const actual = enzymeWrapper.find('.stats-toggler.active').length;

        expect(actual).toBe(1);
    });

    it('should NOT have active class when showStats is false', () => {
        const showStats = false;
        const { enzymeWrapper } = setUp(null, showStats);

        const actual = enzymeWrapper.find('.stats-toggler.active').length;

        expect(actual).toBe(0);
    });

    it('should call passed in function when clicked', () => {
        const { enzymeWrapper, props } = setUp();

        enzymeWrapper.simulate('click');

        expect(props.toggleMatchStats.calledOnce).toBe(true);
    });
});
