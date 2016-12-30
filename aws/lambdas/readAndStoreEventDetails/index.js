const AWS = require('aws-sdk');

const lambda = new AWS.lambda();

exports.handler = (event, context, callback) => {
    console.log(lambda);

    callback(null, 'Success');
};
