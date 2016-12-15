import React, { PropTypes } from 'react';

const MatchStatsButton = ({ matchResults }) => {
    let statsButtonClassName = 'stats-toggler';

    if (matchResults) {
        statsButtonClassName += ' loaded';
    } else {
        statsButtonClassName += ' loading';
    }

    return (
        <button className={statsButtonClassName}><i className='material-icons'>assessment</i></button>
    );
};

export default MatchStatsButton;

MatchStatsButton.propTypes = {
    matchResults: PropTypes.object
};
