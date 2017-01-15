'use strict';

const http      = require('http');
const cheerio   = require('cheerio');

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

function getRound(element) {
    switch(element.find('td').eq(1).text()) {
        case 'FOTABLA':
            return 'season';
        case 'OSZTALYOZO':
            return 'preliminary';
    }
}

function getStats(matchChronology, homeTeam, awayTeam) {
    const homeTeamTables = $(matchChronology).find('table').filter((index, element) => index % 2 === 0 && index !== 8);
    const homeTeamFouls = $(matchChronology).find('table').eq(8);
    const awayTeamTables = $(matchChronology).find('table').filter((index, element) => index % 2 === 1 && index !== 9);
    const awayTeamFouls = $(matchChronology).find('table').eq(9);

    $(homeTeamTables).each(function (index) {
        $(this).find('tr').each(function () {
            const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
            homeTeam.players.find(player => player.id === playerId).stats.periods.push({
                scores: getScores(this)
            });
        });
        homeTeam.players.forEach(player => {
            if (player.stats.periods.length < index + 1) {
                player.stats.periods.push({
                    scores: []
                });
            }
        });
    });

    $(homeTeamFouls).find('tr').each(function () {
        const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
        const fouls = Number($(this).find('td').last().text().split('hibapont')[0].trim());
        homeTeam.players.find(player => player.id === playerId).stats.fouls = fouls;
    });

    $(awayTeamTables).each(function (index) {
        $(this).find('tr').each(function () {
            const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
            awayTeam.players.find(player => player.id === playerId).stats.periods.push({
                scores: getScores(this)
            });
        });
        awayTeam.players.forEach(player => {
            if (player.stats.periods.length < index + 1) {
                player.stats.periods.push({
                    scores: []
                });
            }
        });
    });

    $(awayTeamFouls).find('tr').each(function () {
        const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
        const fouls = Number($(this).find('td').last().text().split('hibapont')[0].trim());
        const player = awayTeam.players.find(player => player.id === playerId);
        
        player.stats.fouls = fouls;
    });
}

function getScores(element) {
    return $(element)
            .find('td')
            .last()
            .text()
            .trim()
            .split(',')
            .map(Number);
}

function getPlayers(homeTeam, awayTeam) {
    const matchPage = $('.match_details_table').eq(0).find('tr')
        .filter(function () {
            return $(this).find('a').length > 0;
        }).next();

    homeTeam.id = getTeamId(matchPage.prev().find('a').eq(0));
    awayTeam.id = getTeamId(matchPage.prev().find('a').eq(1));

    let playerRow = matchPage.eq(0);

    while (playerRow.length > 0) {
        const homePlayerCell = playerRow.find('td').eq(0);

        if (homePlayerCell.find('a').text() !== '') {
            homeTeam.players.push({
                name: getName(homePlayerCell.find('a')),
                id: getQueryParams(homePlayerCell.find('a'))[0].split('=')[1],
                stats: {
                    fouls: 0,
                    periods: []
                }
            });
        }
        
        const awayPlayerCell = playerRow.find('td').eq(1);

        if (awayPlayerCell.find('a').text() !== '') {
            awayTeam.players.push({
                name: getName(awayPlayerCell.find('a')),
                id: getQueryParams(awayPlayerCell.find('a'))[0].split('=')[1],
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

const parseMatchPage = (html, matchId, eventId, matchDetailsLink) => {
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

    let homeTeam = {
        id: '',
        players: []
    };

    let awayTeam = {
        id: '',
        players: []
    };

    getPlayers(homeTeam, awayTeam);

    getStats(matchChronology, homeTeam, awayTeam);

    return {
        homeTeam,
        awayTeam,
        id: matchId,
        date,
        location: {
            name: location
        },
        group,
        round,
        matchDetailsLink
    };
}

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchId = event.matchId;
    const matchDetailsRequest = addQueryParams({ eid: eventId, mid: matchId }, Object.assign({}, requestOptions));
    const matchDetailsLink = matchDetailsRequest.host + matchDetailsRequest.path;

    let body = '';

    const req = http.get(matchDetailsRequest, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseMatchPage(body, matchId, eventId, matchDetailsLink));
        });
    });

    req.on('error', callback);
    req.end();
};

