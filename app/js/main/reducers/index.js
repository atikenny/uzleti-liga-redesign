import { combineReducers }  from 'redux';

import isSidebarOpen        from './sidebar';

const appReducers = combineReducers({
    isSidebarOpen
});

export default appReducers;
