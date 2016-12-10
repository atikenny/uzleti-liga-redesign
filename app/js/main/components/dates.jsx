import React, { PropTypes }     from 'react';
import { connect }              from 'react-redux';

import Matches                  from './matches';

const renderMatches = (matches) => {
    if (matches) {
        return (
            <Matches matches={matches} />
        );
    }
}

const Dates = ({ dates }) => (
    <div id='matches-container' className='sub-page show'>
        {dates.map((date, index) => (
            <div key={index} className='date-container'>
                <h3 className='date'>{date.day}</h3>
                {renderMatches(date.matches)}
            </div>
        ))}
    </div>
);

const mapState = ({ appData }) => {
    return {
        dates: appData.data.dates
    };
};

export default connect(mapState)(Dates);

Dates.propTypes = {
    dates: PropTypes.array.isRequired
};
