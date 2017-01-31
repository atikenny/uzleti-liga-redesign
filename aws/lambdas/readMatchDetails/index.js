'use strict';

const https     = require('https');
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

const getStats = (matchChronology, homeTeam, awayTeam) => {
    const unknownPlayerId = '1';
    const homeTeamTables = $(matchChronology).find('td:nth-child(3):not(:contains("hibapont"))');
    const homeTeamFouls = $(matchChronology).find('table:contains("hibapont")').eq(0);
    const awayTeamTables = $(matchChronology).find('td:nth-child(4):not(:contains("hibapont"))');
    const awayTeamFouls = $(matchChronology).find('table:contains("hibapont")').eq(1);

    $(homeTeamTables).each(function (index) {
        $(this).find('tr').each(function () {
            const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
            
            if (playerId !== unknownPlayerId) {
                const player = homeTeam.players.find(player => player.id === playerId);

                player.stats.periods.push({
                    scores: getScores(this)
                });
            }
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
        
        if (playerId !== unknownPlayerId) {
            const fouls = Number($(this).find('td').last().text().split('hibapont')[0].trim());

            homeTeam.players.find(player => player.id === playerId).stats.fouls = fouls;
        }
    });

    $(awayTeamTables).each(function (index) {
        $(this).find('tr').each(function () {
            const playerId = getQueryParams($(this).find('a'))[0].split('=')[1];
            
            if (playerId !== unknownPlayerId) {
                const player = awayTeam.players.find(player => player.id === playerId);
                
                player.stats.periods.push({
                    scores: getScores(this)
                });
            }
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
        
        if (playerId !== unknownPlayerId) {
            const fouls = Number($(this).find('td').last().text().split('hibapont')[0].trim());
            const player = awayTeam.players.find(player => player.id === playerId);
        
            player.stats.fouls = fouls;
        }
    });
};

const getScores = (element) => {
    return $(element)
        .find('td')
        .last()
        .text()
        .trim()
        .split(',')
        .map(Number);
};

const getPlayers = (homeTeam, awayTeam) => {
    const getTeamId = (element) => getQueryParams(element)[0].split('=')[1];
    const getName = (element) => element.text().split('(')[0].trim();

    const matchPageRows = $('.match_details_table').eq(0).find('tr:has(a)');

    matchPageRows.each((index, element) => {
        if (index === 0) {
            homeTeam.id = getTeamId($(element).find('a').eq(0));
            awayTeam.id = getTeamId($(element).find('a').eq(1));
        } else {
            const homePlayerCell = $(element).find('td:nth-child(1):has(a:not(:empty))');

            if (homePlayerCell.length) {
                homeTeam.players.push({
                    name: getName(homePlayerCell.find('a')),
                    id: getQueryParams(homePlayerCell.find('a'))[0].split('=')[1],
                    stats: {
                        fouls: 0,
                        periods: []
                    }
                });
            }
            
            const awayPlayerCell = $(element).find('td:nth-child(2):has(a:not(:empty))');

            if (awayPlayerCell.length) {
                awayTeam.players.push({
                    name: getName(awayPlayerCell.find('a')),
                    id: getQueryParams(awayPlayerCell.find('a'))[0].split('=')[1],
                    stats: {
                        fouls: 0,
                        periods: []
                    }
                });
            }
        }
    });
};

const parseMatchPage = (html, matchId, eventId, matchDetailsLink) => {
    const getRound = (roundName) => {
        switch (roundName) {
            case 'FOTABLA':
                return 'season';
            case 'OSZTALYOZO':
                return 'preliminary';
        }
    };

    $ = cheerio.load(html);

    const $matchChronology = $('.match_details_table:contains("Meccs kronológia")');
    const $matchTable = $('.match_details_table:contains("Meccslap")');
    
    const date = $matchTable.find('tr:contains("Dátum") td:nth-child(2)').text();
    const location = $matchTable.find('tr:contains("Helyszín") td:nth-child(2)').text();
    const group = $matchTable.find('tr:contains("Csoport") td:nth-child(2)').text().split('-')[0];
    const round = getRound($matchTable.find('tr:contains("Szakasz") td:nth-child(2)').text());

    let homeTeam = {
        id: '',
        players: []
    };

    let awayTeam = {
        id: '',
        players: []
    };

    getPlayers(homeTeam, awayTeam);

    getStats($matchChronology, homeTeam, awayTeam);

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
};

exports.handler = (event, context, callback) => {
    const eventId = event.eventId;
    const matchId = event.matchId;
    const matchDetailsRequest = addQueryParams({ eid: eventId, mid: matchId }, Object.assign({}, requestOptions));
    const matchDetailsLink = 'https://' + matchDetailsRequest.host + matchDetailsRequest.path;

    let body = '';

    const req = https.get(matchDetailsRequest, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            callback(null, parseMatchPage(body, matchId, eventId, matchDetailsLink));
        });
    });

    req.on('error', callback);
    req.end();
};
