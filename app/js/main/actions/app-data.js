import * as dataModel       from  '../../../../docs/data-model';
import { mapEventData }     from '../transformers/matches';
import { addMatch }         from './matches';

const fetchingData = () => {
    return {
        type: 'FETCHING_DATA'
    };
};

const receivedData = (data) => {
    return {
        type: 'RECEIVED_DATA',
        data: data
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

        return Promise.resolve(dataModel.default.events[0]) // fetch data from server
            .then(mapEventData)
            .then(data => addMatchesState(data, dispatch))
            .then(data => dispatch(receivedData(data)));
    };
};