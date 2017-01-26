'use strict';

const http      = require('http');
const cheerio   = require('cheerio');

let $;

const requestOptions = {
    host: 'www.uzletiliga.hu',
    path: '/eredmenyek/matches.php'
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

const getMatchId = (href) => {
    return href.split('&')[1].split('=')[1];
};

const parseEventPage = (html, eventId) => {
    $ = cheerio.load(html);

    const $matches = $('body').find('.matches_table').find('tr:has(:nth-child(4)):has(td)');

    let matchIds = [];
    $matches.map(function () {
        return $(this).find('td').eq(3).find('a').prop('href');
    }).each(function () {
        matchIds.push(getMatchId(this));
    });

    return {
        eventId: eventId,
        matchIds: matchIds
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchesRequest = addQueryParams({ eid: eventId }, Object.assign({}, requestOptions));
    const matchesLink = 'http://' + matchesRequest.host + matchesRequest.path;

    let body = '';

    const req = http.get(matchesRequest, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseEventPage(body, eventId));
        });
    });

    req.on('error', callback);
    req.end();
};

exports.handler({eventId: 275}, {}, () => {});
