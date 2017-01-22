'use strict';

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

const getUpdateTeamsParams = (eventId, teams) => {
    return {
        TableName: 'events',
        Key: {
            'id': eventId
        },
        UpdateExpression: 'SET teams = :teams',
        ExpressionAttributeValues: {
            ':teams': teams
        },
        ReturnValues: 'UPDATED_NEW'
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const teams = event.teams;

    dynamo.updateItem(getUpdateTeamsParams(eventId, teams), (error, result) => {
        if (error) {
            callback(null, error);
        }
        
        callback(null, result);
    });
};
