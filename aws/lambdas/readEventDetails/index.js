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
        eventId,
        league,
        year,
        matches
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;

    let body = '';

    const req = http.get(addQueryParams({ eid: eventId }, requestOptions), (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseMatchesPage(eventId, body));
        });
    });

    req.on('error', callback);
    req.end();
};
