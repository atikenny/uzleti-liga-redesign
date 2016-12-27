const defaultState = {
    isFetching: false,
    data: {
        dates: []
    }
};

const appData = (state = defaultState, action) => {
    switch (action.type) {
        case 'FETCHING_DATA':
            return {
                isFetching: true,
                data: state.data
            };
        case 'RECEIVED_DATA':
            return {
                isFetching: false,
                data: action.data
            };
        default:
            return state;
    }
};

export default appData;
