import React from 'react';
import { mount } from 'enzyme';

import { MatchTeams } from './match-teams';

function setUp(winnerTeamId) {
    const props = {
        match: {
            results: {
                winnerTeamId: winnerTeamId
            },
            homeTeam: {
                id: 1,
                name: 'home',
                link: 'home link'
            },
            awayTeam: {
                id: 2,
                name: 'away',
                link: 'away link'
            }
        }
    };

    const wrapper = mount(<MatchTeams {...props}/>);

    return {
        props: props,
        enzymeWrapper: wrapper
    };
}

describe('MatchTeams', () => {
    it('should have a div HTMLElement with classes: \'home team winner\'', () => {
        const { enzymeWrapper } = setUp(1);

        const actual = enzymeWrapper.find('.home.team.winner').length

        expect(actual).toBe(1);
    });

    it('should have a div HTMLElement with classes: \'away team winner\'', () => {
        const { enzymeWrapper } = setUp(2);

        const actual = enzymeWrapper.find('.away.team.winner').length

        expect(actual).toBe(1);
    });

    describe('home team div HTMLElement', () => {
        it('should have an a HTMLElement with given properties', () => {
            const { enzymeWrapper, props } = setUp();

            const actual = enzymeWrapper.find('.home.team > a');

            expect(actual.prop('href')).toBe(props.match.homeTeam.link);
            expect(actual.text()).toBe(props.match.homeTeam.name);
        });
    });

    describe('away team div HTMLElement', () => {
        it('should have an a HTMLElement with given properties', () => {
            const { enzymeWrapper, props } = setUp();

            const actual = enzymeWrapper.find('.away.team > a');

            expect(actual.prop('href')).toBe(props.match.awayTeam.link);
            expect(actual.text()).toBe(props.match.awayTeam.name);
        });
    });
});
