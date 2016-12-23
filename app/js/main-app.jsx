import React            from 'react';
import ReactDOM         from 'react-dom';
import thunkMiddleware  from 'redux-thunk';
import { Provider }     from 'react-redux';
import {
    createStore,
    applyMiddleware
}  from 'redux';

import BusinessLeague   from './components/business-league';
import appReducers      from './reducers';
import { fetchData }    from './actions/app-data';

let store = createStore(
    appReducers,
    applyMiddleware(thunkMiddleware)
);

store.dispatch(fetchData());

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Provider store={store}>
            <BusinessLeague />
        </Provider>,
        document.getElementById('business-league-app')
    );
});
