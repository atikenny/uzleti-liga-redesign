'use strict';

const http      = require('http');
const cheerio   = require('cheerio');

const requestOptions = {
    host: 'www.uzletiliga.hu',
    path: '/eredmenyek/match_details3.php'
};

const addQueryParams = (queryParams, requestOptions) => {
    requestOptions.path += Object.keys(queryParams).reduce((queryParamsString, paramKey, paramIndex) => {
        if (paramIndex === 0) {
            queryParamsString += '?';
        } else {
            queryParamsString += '&';
        }

        return queryParamsString += `${paramKey}=${queryParams[paramKey]}`;
    }, '');
    
    return requestOptions;
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchId = event.matchId;

    let body = '';

    const req = http.get(addQueryParams({ eid: eventId, mid: matchId }, requestOptions), (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, body);
        });
        res.on('error', callback);
    });

    req.on('error', callback);
    req.end();
};