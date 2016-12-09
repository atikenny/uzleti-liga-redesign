import React from 'react';

const matches = [];

const Matches = React.createClass({
    render() {
        return (
            <div id='matches-container' className='sub-page show'>
                {matches.map((match) => (
                    <div className='date-container'></div>
                ))}
            </div>
        );
    }
});

export default Matches;
