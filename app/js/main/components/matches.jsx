import React, { PropTypes } from 'react';

const Matches = ({ matches }) => (
    <ul className='matches'>
        {matches.map((match) => (
            <li key={match.id} className='match card'>
            	<div className='teams'>
            		<div className='home team'>
                        <a href={match.homeTeam.link}>{match.homeTeam.name}</a>
                    </div>
            		<div className='away team'>
                        <a href={match.awayTeam.link}>{match.awayTeam.name}</a>
                    </div>
            	</div>
            </li>
        ))}
    </ul>
);

export default Matches;

Matches.propTypes = {
	matches: PropTypes.array.isRequired
};
