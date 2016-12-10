import React, { PropTypes }     from 'react';

const Matches = ({ matches }) => (
    <ul className='matches'>
        {matches.map((match) => (
            <li key={match.id} className='match card'>
            	<div className='teams'>
            		<div className='home team'>{match.homeTeam.name}</div>
            		<div className='away team'>{match.awayTeam.name}</div>
            	</div>
            </li>
        ))}
    </ul>
);

export default Matches;

Matches.propTypes = {
	matches: PropTypes.array.isRequired
};
