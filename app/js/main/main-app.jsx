import React            from 'react';
import ReactDOM         from 'react-dom';
import { Provider }     from 'react-redux';
import { createStore }  from 'redux';

import BusinessLeague   from './components/business-league';
import appReducers      from './reducers';

let store = createStore(appReducers);

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <BusinessLeague />
        </Provider>,
        document.getElementById('business-league-app')
    );
});
