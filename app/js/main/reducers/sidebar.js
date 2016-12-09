const isSidebarOpen = (state = false, action) => {
    switch (action.type) {
        case 'OPEN':
            return true;
        case 'CLOSE':
            return false;
        case 'TOGGLE':
            return !state;
        default:
            return state;
    }
};

export default isSidebarOpen;
