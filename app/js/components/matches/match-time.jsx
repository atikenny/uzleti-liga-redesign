import React, { PropTypes } from 'react';

export const MatchTime = ({ match }) => (
    <div className='match-time-container'>
        <a href={match.matchDetailsLink}>
            <i className='material-icons'>schedule</i>
            <span>{match.time}</span>
        </a>
    </div>
);

MatchTime.propTypes = {
    match: PropTypes.object.isRequired
};
