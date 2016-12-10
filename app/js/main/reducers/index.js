import { combineReducers }  from 'redux';

import isSidebarOpen        from './sidebar';
import appData              from './app-data';

const appReducers = combineReducers({
    isSidebarOpen,
    appData
});

export default appReducers;
