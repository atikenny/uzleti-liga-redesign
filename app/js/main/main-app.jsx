import React from 'react';
import ReactDOM from 'react-dom';

import BusinessLeague from './components/business-league';

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <BusinessLeague />,
        document.getElementById('business-league-app')
    );
});
