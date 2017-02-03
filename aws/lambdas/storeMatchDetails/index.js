'use strict';

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

const getQueryEventParams = (eventId) => {
    return {
        TableName: 'events',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': eventId
        }
    };
};

const getUpdateMatchParams = (eventId, matchIndex, matchDetails, existingMatches) => {
    return {
        TableName: 'events',
        Key: {
            'id': eventId
        },
        UpdateExpression: 'SET matches[' + matchIndex + '] = :matchDetails',
        ExpressionAttributeValues: {
            ':matchDetails': matchDetails
        },
        ReturnValues: 'UPDATED_NEW'
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchId = event.matchId;
    const matchDetails = Object.assign({ id: matchId }, event.matchDetails);

    const processQueryResults = (error, results) => {
        if (error) {
            callback(error);
        }

        const matches = (results.Items.length && results.Items[0].matches) || [];
        let matchIndex;

        matches.some((match, index) => {
            if (match.id === matchId) {
                matchIndex = index;

                return true;
            }
        });

        if (matchIndex !== undefined) {
            dynamo.updateItem(getUpdateMatchParams(eventId, matchIndex, matchDetails), (error, result) => {
                if (error) {
                    callback(error);
                }
                
                callback(null, result);
            });
        } else {
            callback(new Error('Could not find match by id: ' + matchId));
        }
    };

    dynamo.query(getQueryEventParams(eventId), processQueryResults);
};
