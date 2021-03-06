import React, { PropTypes }     from 'react';
import { connect }              from 'react-redux';

import { toggleMatchStats }     from '../../actions/matches';

// For testing purposes we are exporting the unwrapped component
export const MatchStatsButton = ({ matchResults, toggleMatchStats, showStats }) => {
    let statsButtonClassName = 'stats-toggler';

    if (matchResults) {
        statsButtonClassName += ' loaded';
    } else {
        statsButtonClassName += ' loading';
    }

    if (showStats) {
        statsButtonClassName += ' active';
    }

    return (
        <button className={statsButtonClassName} onClick={toggleMatchStats}>
            <i className='material-icons'>assessment</i>
        </button>
    );
};

const mapDispatch = (dispatch, ownProps) => {
    return {
        toggleMatchStats: () => {
            dispatch(toggleMatchStats(ownProps.matchId));
        }
    };
};

export default connect(null, mapDispatch)(MatchStatsButton);

MatchStatsButton.propTypes = {
    matchId: PropTypes.number.isRequired,
    showStats: PropTypes.bool.isRequired,
    matchResults: PropTypes.object,
    toggleMatchStats: PropTypes.func
};
