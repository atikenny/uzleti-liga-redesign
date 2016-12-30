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

const getPutEventParams = (eventDetails) => {
    return {
        TableName: 'events',
        Item: eventDetails
    };
};

const getUpdateEventParams = (eventDetails, existingMatches) => {
    const newMatches = eventDetails.matches.filter(doesMatchExist.bind(null, existingMatches));

    return {
        TableName: 'events',
        Key: {
            'id': eventDetails.id
        },
        UpdateExpression: 'SET matches = list_append(matches, :matches)',
        ExpressionAttributeValues: {
            ':matches': newMatches
        },
        ReturnValues: 'UPDATED_NEW'
    };
};

const doesMatchExist = (existingMatches, match) => !existingMatches.some(existingMatch => existingMatch.id === match.id);

exports.handler = (event, context, callback) => {
    const eventDetails = event.event;

    const processQueryResults = (error, results) => {
        if (error) {
            callback(null, error);
        }

        if (!results.Items.length) {
            dynamo.putItem(getPutEventParams(eventDetails), callback);
        } else {
            dynamo.updateItem(getUpdateEventParams(eventDetails, results.Items[0].matches), callback);
        }
    };

    dynamo.query(getQueryEventParams(eventDetails.id), processQueryResults);
};
