import { addMatch }         from './matches';
import { mapEventData }     from '../transformers/matches';
import { getEventData }     from '../aws-client';

const fetchingData = () => {
    return {
        type: 'FETCHING_DATA'
    };
};

const receivedData = (data) => {
    return {
        type: 'RECEIVED_DATA',
        data
    };
};

const addMatchesState = (data, dispatch) => {
    data.dates.forEach((date) => {
        date.matches.forEach((match) => {
            dispatch(addMatch(match.id));
        });
    });

    return data;
};

export const fetchData = () => {
    return (dispatch) => {
        dispatch(fetchingData());

        return getEventData(275)
            .then(mapEventData)
            .then(response => addMatchesState(response, dispatch))
            .then(response => dispatch(receivedData(response)));
    };
};
