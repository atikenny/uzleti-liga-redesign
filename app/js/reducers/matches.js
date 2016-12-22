const match = (state = {}, action) => {
    switch (action.type) {
        case 'ADD_MATCH':
            return {
                id: action.id,
                showStats: false
            };
        case 'TOGGLE_MATCH_STATS':
            if (state.id !== action.id) {
                return state;
            }

            return Object.assign({}, state, {
                showStats: !state.showStats
            });
        default:
            return state;
    }
};

const matches = (state = [], action) => {
    switch (action.type) {
         case 'ADD_MATCH':
            return [
                ...state,
                match(undefined, action)
            ];
        case 'TOGGLE_MATCH_STATS':
            return state.map(m => match(m, action));
        default:
            return state;
    }
};

export default matches;
