const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

const invokeReadTeamsPage = (eventId) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'readTeamsPage',
            Payload: JSON.stringify({ eventId: eventId })
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            
            resolve(JSON.parse(result.Payload));
        });
    });
};

const invokeStoreTeams = (eventId, teams) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'storeTeams',
            Payload: JSON.stringify({
                eventId: eventId,
                teams: teams
            })
        }, (error, result) => {
            if (error || result.FunctionError) {
                reject(error || result.Payload);
            }
            
            resolve(result);
        });
    });
};

exports.handler = (event, context, callback) => {
    const eventId = String(event.eventId);
    const boundStoreTeams = invokeStoreTeams.bind(null, eventId);

    invokeReadTeamsPage(eventId)
        .then(boundStoreTeams)
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            callback(null, error);
        });
};
