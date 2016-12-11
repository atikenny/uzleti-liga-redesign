import React, { PropTypes } from 'react';

export const MatchScores = ({ match }) => (
    <div className='scores-container'>
        <button className='stats-toggler loading'><i className='material-icons'>assessment</i></button>
        <a className='scores' href={match.matchDetailsLink}>
            <span className='home score'>{match.results.scores.home}</span>
            <span className='away score'>{match.results.scores.away}</span>
        </a>
        <ul className='quarters'>
            {match.results.periodScores.map((periodScore, index) => (
                <li key={index} className='result'>{periodScore.home}:{periodScore.away}</li>
            ))}
        </ul>
        <div className='match-stats-container'></div>
    </div>
);

MatchScores.propTypes = {
    match: PropTypes.object.isRequired
};
