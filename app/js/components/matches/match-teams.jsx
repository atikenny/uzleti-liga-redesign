import React, { PropTypes } from 'react';

export const MatchTeams = ({ match }) => {
    let homeTeamClassName = 'home team';
    let awayTeamClassName = 'away team';

    if (match.results && match.homeTeam.id === match.results.winnerTeamId) {
        homeTeamClassName += ' winner';
    }

    if (match.results && match.awayTeam.id === match.results.winnerTeamId) {
        awayTeamClassName += ' winner';
    }

    return (
        <div className='teams'>
            <div className={homeTeamClassName}>
                <a href={match.homeTeam.link}>{match.homeTeam.name}</a>
            </div>
            <div className={awayTeamClassName}>
                <a href={match.awayTeam.link}>{match.awayTeam.name}</a>
            </div>
        </div>
    );
};

MatchTeams.propTypes = {
    match: PropTypes.object.isRequired
};

