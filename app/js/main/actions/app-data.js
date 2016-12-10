import * as dataModel       from  '../../../../docs/data-model';
import { mapEventData }     from '../transformers/matches';

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

export const fetchData = () => {
    return (dispatch) => {
        dispatch(fetchingData());

        return Promise.resolve(dataModel.default.events[0]) // fetch data from server
            .then(mapEventData)
            .then(data => dispatch(receivedData(data)));
    };
};