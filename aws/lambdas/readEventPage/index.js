'use strict';

const http      = require('http');
const cheerio   = require('cheerio');

let $;

const requestOptions = {
    host: 'www.uzletiliga.hu',
    path: '/eredmenyek/matches.php'
};

const addQueryParams = (queryParams, requestOptions) => {
    requestOptions.path += Object.keys(queryParams).reduce((queryParamsString, paramKey) => {
        return queryParamsString += `${paramKey}=${queryParams[paramKey]}`;
    }, '?');
    
    return requestOptions;
};

const parseMatchesPage = (html) => {
    $ = cheerio.load(html);

    return $('.matches_table').html();
};

exports.handler = (event, context, callback) => {
    const eventId = event.queryStringParameters.eventId;

    let body = '';

    const req = http.get(addQueryParams({ eid: eventId }, requestOptions), (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseMatchesPage(body));
        });
    });

    req.on('error', callback);
    req.end();
};
