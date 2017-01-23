import React, { PropTypes }     from 'react';
import { connect }              from 'react-redux';

import MatchStatsButton         from './match-stats-button';
import MatchStats               from './match-stats';
import { MatchTeams }           from './match-teams';
import MatchScores              from './match-scores';
import { MatchTime }            from './match-time';
import { MatchLocation }        from './match-location';

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

const renderMatchDetails = (match) => {
    if (match.showStats) {
        return (
            <MatchStats match={match} />
        );
    } else {
        return (
            <div className='match-details'>
                <MatchTeams match={match} />
                {renderScores(match)}
                <MatchLocation location={match.location} />
            </div>
        );
    }
};

const renderMatch = (match) => (
    <li key={match.id} className='match card'>
        <MatchStatsButton matchId={match.id} matchResults={match.results} showStats={match.showStats} />
        {renderMatchDetails(match)}
    </li>
);

const Matches = ({ matches }) => (
    <ul className='matches'>
        {matches.map(renderMatch)}
    </ul>
);

const matchById = (matchId, match) => match.id === matchId;

const mapState = ({ matches }, ownProps) => {
    return {
        matches: ownProps.matches.map(matchProp => Object.assign({}, matchProp, matches.find(matchById.bind(null, matchProp.id))))
    };
};

export default connect(mapState)(Matches);

Matches.propTypes = {
    matches: PropTypes.array.isRequired
};
