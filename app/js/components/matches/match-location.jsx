import React, { PropTypes } from 'react';

export const MatchLocation = ({ location }) => (
    <div className='location-container'>
        <a className='location' href={location.link}>
            <i className='material-icons'>location_on</i>
            <span>{location.name}</span>
        </a>
    </div>
);

MatchLocation.propTypes = {
    location: PropTypes.object.isRequired
};
