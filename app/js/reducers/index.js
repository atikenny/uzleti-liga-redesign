import { combineReducers }  from 'redux';

import isSidebarOpen        from './sidebar';
import appData              from './app-data';
import matches              from './matches';

const appReducers = combineReducers({
    isSidebarOpen,
    appData,
    matches
});

export default appReducers;
