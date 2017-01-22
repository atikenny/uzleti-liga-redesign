'use strict';

const http      = require('http');
const cheerio   = require('cheerio');

let $;

const requestOptions = {
    host: 'www.uzletiliga.hu',
    path: '/eredmenyek/teams.php'
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

const parseTeamsPage = (html) => {
    $ = cheerio.load(html);

    const teamLinkElements = $('.teams_table a[href^="team_details.php"]').toArray();

    return teamLinkElements.map(mapTeamLink);
};

const mapTeamLink = (teamLinkElement) => {
    const $element = $(teamLinkElement);
    const teamId = $element.attr('href').split('=').pop();
    const teamName = $element.text();
    const teamLink = 'http://' + requestOptions.host + '/eredmenyek/' + $element.attr('href');

    return {
        id: teamId,
        name: teamName,
        link: teamLink
    };
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const teamsPageRequest = addQueryParams({ eid: eventId }, Object.assign({}, requestOptions));

    let body = '';

    const req = http.get(teamsPageRequest, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseTeamsPage(body));
        });
    });

    req.on('error', callback);
    req.end();
};
