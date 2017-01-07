'use strict';

const http      = require('http');
const cheerio   = require('cheerio');
const _         = require('lodash');

let $;

const requestOptions = {
    host: 'www.uzletiliga.hu',
    path: '/eredmenyek/match_details3.php'
};

const getQueryParams = (element) => {
    if (!$(element).prop('href')) {
        throw new Error('No href attribute');
    }

    return $(element).prop('href').split('?')[1].split('&');
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

const parseMatchPage = (html, matchId, eventId) => {
    $ = cheerio.load(html);

    const matchChronology = $('.match_details_table').filter((index, element) => {
        return $(element).find('h6').text() === 'Meccs kronológia';
    });

    const matchTable = $('.match_details_table').filter((index, element) => {
        return $(element).find('h6').text() === 'Meccslap';
    });

    const date = matchTable.find('tr').filter(function () {
        return $(this).find('td').eq(0).text() === 'Dátum';
    }).find('td').eq(1).text().split(' ').join(':');

    const location = matchTable.find('tr').filter(function () {
        return $(this).find('td').eq(0).text() === 'Helyszín';
    }).find('td').eq(1).text();

    const round = getRound(matchTable.find('tr').filter(function () {
        return $(this).find('td').eq(0).text() === 'Szakasz';
    }));

    const group = matchTable.find('tr').filter(function () {
        return $(this).find('td').eq(0).text() === 'Csoport';
    }).find('td').eq(1).text().split('-')[0];

    const { host, path } = addQueryParams({ eid: eventId, mid: matchId }, Object.assign({}, requestOptions));

    const matchDetailsLink = host + path;

    let homeTeam = {
        id: '',
        players: []
    };

    let awayTeam = {
        id: '',
        players: []
    };

    getPlayers(homeTeam, awayTeam);

    function getMatchDetailsLink(eventId, matchId) {
        return `http://www.uzletiliga.hu/eredmenyek/match_details3.php?eid=${eventId}&mid=${matchId}`;
    }

const asd = (event, context, callback) => {
    // const eventId = event.eventId;
    // const matchId = event.matchId;

    // let body = '';
    parseMatchPage(html);
    // console.log(parseMatchPage(html));

    // const req = http.get(addQueryParams({ eid: eventId, mid: matchId }, requestOptions), (res) => {
    //     res.setEncoding('utf8');
    //     res.on('data', (chunk) => body += chunk);
    //     res.on('end', () => {
    //         callback(null, body);
    //     });
    //     res.on('error', callback);
    // });

    // req.on('error', callback);
    // req.end();
};

asd();

    function getPlayers(homeTeam, awayTeam) {
        const matchPage = $('.match_details_table').eq(0).find('tr')
            .filter(function () {
                return $(this).find('a').length > 0;
            }).next();

        homeTeam.id = getTeamId(matchPage.prev().find('a').eq(0));
        awayTeam.id = getTeamId(matchPage.prev().find('a').eq(1));

        let playerRow = matchPage.eq(0);

        while (playerRow.length > 0) {
            if (playerRow.find('a').eq(0).text() !== '') {
                homeTeam.players.push({
                    name: getName(playerRow.find('a').eq(0)),
                    id: getQueryParams(playerRow.find('a').eq(0))[0].split('=')[1],
                    stats: {
                        fouls: 0,
                        periods: []
                    }
                });
            }

            if (playerRow.find('a').eq(1).text() !== '') {
                awayTeam.players.push({
                    name: getName(playerRow.find('a').eq(1)),
                    id: getQueryParams(playerRow.find('a').eq(1))[0].split('=')[1],
                    stats: {
                        fouls: 0,
                        periods: []
                    }
                });
            }

            playerRow = playerRow.next();
        }

        function getTeamId(element) {
            return getQueryParams(element)[0].split('=')[1];
        }

        function getName(element) {
            return element.text().split('(')[0].trim();
        }
    }
}

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchId = event.matchId;

    let body = '';

    const req = http.get(addQueryParams({ eid: eventId, mid: matchId }, Object.assign({}, requestOptions)), (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseMatchPage(body, matchId, eventId));
        });
    });

    req.on('error', callback);
    req.end();
};

