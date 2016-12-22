export const addMatch = (id) => {
    return {
        type: 'ADD_MATCH',
        id
    };
};

export const toggleMatchStats = (id) => {
    return {
        type: 'TOGGLE_MATCH_STATS',
        id
    };
};
