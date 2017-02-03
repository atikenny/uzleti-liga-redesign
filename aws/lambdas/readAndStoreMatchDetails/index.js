const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const invokeReadMatchDetails = (eventId, matchId) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'readMatchDetails',
            Payload: JSON.stringify({
                eventId: eventId,
                matchId: matchId
            })
        }, (err, result) => {
            if (err) {
                reject('readMatchDetails error: ', err);
            }

            resolve(JSON.parse(result.Payload));
        });
    });
};

const invokeStoreMatchDetails = (eventId, matchId, matchDetails) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'storeMatchDetails',
            Payload: JSON.stringify({
                eventId: eventId,
                matchId: matchId,
                matchDetails: matchDetails
            })
        }, (error, result) => {
            const errorMessage = error || JSON.parse(result.Payload).errorMessage;

            if (errorMessage) {
                reject('storeMatchDetails error for eventId: ' + eventId + ', matchId: ' + matchId + ', error message: ' + errorMessage);
            }

            resolve(result);
        });
    });
};

exports.handler = (event, context, callback) => {
    const eventId = String(event.eventId);
    const matchId = Number(event.matchId);
    const boundStoreMatchDetails = invokeStoreMatchDetails.bind(null, eventId, matchId);

    invokeReadMatchDetails(eventId, matchId)
        .then(boundStoreMatchDetails)
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            callback(error);
        });
};
