import React, { PropTypes } from 'react';

const MatchScores = ({ match }) => (
    <div className='scores-container'>
        <a className='scores' href={match.matchDetailsLink} target="_blank">
            <span className='home score'>{match.results.scores.home}</span>
            <span className='away score'>{match.results.scores.away}</span>
        </a>
        <ul className='quarters'>
            {match.results.periodScores.map((periodScore, index) => (
                <li key={index} className='result'>{periodScore.home}:{periodScore.away}</li>
            ))}
        </ul>
    </div>
);

export default MatchScores;

MatchScores.propTypes = {
    match: PropTypes.object.isRequired
};
