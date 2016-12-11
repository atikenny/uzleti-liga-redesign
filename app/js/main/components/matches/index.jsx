import React, { PropTypes } from 'react';

import { MatchTeams }       from './match-teams';
import { MatchScores }      from './match-scores';
import { MatchTime }        from './match-time';
import { MatchLocation }    from './match-location';

const renderScores = (match) => {
    if (match.results) {
        return (
            <MatchScores match={match} />
        );
    } else {
        return (
            <MatchTime match={match} />
        );
    }
};

export const Matches = ({ matches }) => (
    <ul className='matches'>
        {matches.map((match) => (
            <li key={match.id} className='match card'>
            	<MatchTeams match={match} />
                {renderScores(match)}
                <MatchLocation location={match.location} />
            </li>
        ))}
    </ul>
);

Matches.propTypes = {
	matches: PropTypes.array.isRequired
};
