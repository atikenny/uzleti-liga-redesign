import * as dataModel from  '../../../../docs/data-model';

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
            .then(data => dispatch(receivedData(data)));
    };
};