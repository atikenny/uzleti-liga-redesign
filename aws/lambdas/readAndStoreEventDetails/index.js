const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const invokeReadEventDetails = (eventId) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'readEventDetails',
            Payload: JSON.stringify({ eventId: eventId })
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            
            resolve(JSON.parse(result.Payload));
        });
    });
};

const invokeStoreEventDetails = (eventDetails) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'storeEventDetails',
            Payload: JSON.stringify({ event: eventDetails })
        }, (error, result) => {
            if (error || result.FunctionError) {
                reject(error || result.Payload);
            }
            
            resolve(result);
        });
    });
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;

    invokeReadEventDetails(eventId)
        .then(invokeStoreEventDetails)
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            callback(null, error);
        });
};
