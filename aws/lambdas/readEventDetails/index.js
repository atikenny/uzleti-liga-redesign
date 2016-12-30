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

const parseMatchesPage = (eventId, html) => {
    $ = cheerio.load(html);

    const getMatchId = ($resultCell) => {
        const matchDetailsLink = $resultCell.find('a').attr('href');

        return Number(matchDetailsLink.substr(matchDetailsLink.indexOf('mid=') + 4));
    };

    const matches = $('.matches_table tr').toArray().reduce((matches, row) => {
        const isGameRow = $(row).children('td').length === 4;

        if (isGameRow) {
            matches.push({
                id: getMatchId($(row).children('td').eq(3))
            });
        }

        return matches;
    }, []);

    const league = $('.eventmenu_table h2').html();
    const year = $('.idenyaktiv').html();

    return {
        id: eventId,
        league,
        year,
        matches
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;

    let body = '';

    const request = http.get(addQueryParams({
        eid: eventId,
        ie: Date.now() /* cache busting */
    }, requestOptions), (response) => {
        response.setEncoding('utf8');
        response.on('data', (chunk) => body += chunk);
        response.on('end', () => {
            callback(null, parseMatchesPage(eventId, body));
        });
    });

    request.on('error', callback);
    request.end();
};
