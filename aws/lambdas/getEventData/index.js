'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res.Items[0]),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    });

    switch (event.httpMethod) {
        case 'GET':
            dynamo.query({
                TableName: 'events',
                KeyConditionExpression: "#id = :id",
                ExpressionAttributeNames:{
                    "#id": "id"
                },
                ExpressionAttributeValues: {
                    ":id": "1"
                }
            }, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
