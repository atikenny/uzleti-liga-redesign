'use strict';

const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');

const dynamo = new doc.DynamoDB();
const lambda = new AWS.Lambda();

const getQueryEmptyMatchesParams = (eventId) => {
    return {
        TableName: 'events',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': eventId
        }
    };
};

const invokeReadAndStoreMatchDetails = (eventId, matchId) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'readAndStoreMatchDetails',
            Payload: JSON.stringify({ eventId: eventId, matchId: matchId })
        }, (error, result) => {
            const errorMessage = error || JSON.parse(result.Payload).errorMessage;

            if (errorMessage) {
                reject('readAndStoreMatchDetails failed for matchId: ' + matchId + ', error message: ' + errorMessage);
            }

            console.log('Match details read and stored for matchId: ', matchId);
            resolve(matchId);
        });
    });
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const maxLambdaCalls = 50;

    const findEmptyMatches = (error, results) => {
        if (error) {
            callback(error);
        }

        const matches = (results.Items.length && results.Items[0].matches) || [];
        let readAndStorePromises = [];
        
        matches
            .filter(match => !match.date)
            .slice(0, maxLambdaCalls - 1)
            .forEach(match => {
                const matchId = Number(match.id);

                readAndStorePromises.push(invokeReadAndStoreMatchDetails(eventId, matchId));
            });
        
        Promise.all(readAndStorePromises)
            .then(results => {
                callback(null, { result: results });
            }, reason => {
                callback(reason);
            });
    };

    dynamo.query(getQueryEmptyMatchesParams(eventId), findEmptyMatches);
};
