import React from 'react';
import { mount } from 'enzyme';
import store from '../../test-helper';

import MatchScores from './match-scores';

function setup() {
    const match = {
        matchDetailsLink: 'some link',
        results: {
            scores: {
                home: 2,
                away: 1
            },
            periodScores: [
                { home: 1, away: 0 },
                { home: 1, away: 1 }
            ]
        }
    }

    const props = {
        store: store,
        match: match
    };

    const enzymeWrapper = mount(<MatchScores {...props}/>);

    return {
        props,
        enzymeWrapper
    };
}

describe('MatchScores', () => {
    it('should have an a HTMLElement with href: some link', () => {
        const { enzymeWrapper, props } = setup();

        const actual = enzymeWrapper.find('.scores').prop('href');

        expect(actual).toBe(props.match.matchDetailsLink);
    });

    it('should have a span HTMLElmenet with classes: \'home score\' with text: 2', () => {
        const { enzymeWrapper, props } = setup();

        const actual = enzymeWrapper.find('.home.score').text();

        expect(parseInt(actual)).toBe(props.match.results.scores.home);
    });

    it('should have a span HTMLElmenet with classes: \'home score\' with te: \'away score\' with text: 1', () => {
        const { enzymeWrapper, props } = setup();

        const actual = enzymeWrapper.find('.away.score').text();

        expect(parseInt(actual)).toBe(props.match.results.scores.away);
    });

    describe('ul HTMLElement', () => {
        it('should have two children', () => {
            const { enzymeWrapper, props } = setup();

            const actual = enzymeWrapper.find('ul').children().length;

            expect(actual).toBe(props.match.results.periodScores.length);
        });

        it('should have two li HTMLElement with given text', () => {
            const { enzymeWrapper, props } = setup();
            const periodScores = props.match.results.periodScores;

            enzymeWrapper.find('ul').children().forEach((li, index) => {
                const periodScore = periodScores[index];
                const score = `${periodScore.home}:${periodScore.away}`;

                expect(li.text()).toBe(score);
            });
        });
    });
});
