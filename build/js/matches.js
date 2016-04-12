const redesigner = (sidebarItems) => {
    const activePageName = $('.lap').html();
    const activeLeagueName = $('.eventmenu_table h2').html();
    const todayTimestamp = Date.parse((new Date()).toISOString().substr(0, 10));
    
    let $hamburgerMenu;
    let $sidebar;
    let $seasonsList;
    let $loginButton;
    let $todayButton;
    let $statsButton;
    let $filterButton;
    let $filter;
    let $showFinishedButton;
    let $showAllTeamsButton;
    let $teamSelectors;
    let $filteringButtons;
    let $tabs;
    let $stats;
    let $individualStats;
    let individualStats;
    let $matchesContainer;
    let activeTeamIds = [];
    let teams = [];
    let stats = {};
    let filteredStats = {};
    let matches = {};

    const init = (sidebarItems) => {
        appendMetaTags();
        appendMenuItems();
        appendSidebarItems(getSidebarItemsHTML(sidebarItems));
        cleanupHTML();
        matches = collectMatches(statsCollector);
        appendMatches(matches);
        teams.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        appendFilter(teams);
        appendStats(teams, matches);
        statsCollector.promises.individualStats.then((data) => {
            delete data.id;
            individualStats = data;
            renderIndividualStats(individualStats);
        });
        setActiveTeamIds();
        attachEventHandlers();
    };

    const appendMetaTags = () => {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    };

    const appendMenuItems = () => {
        const menuItems = (`
            <button class="hamburger-menu"><i class="material-icons">menu</i></button>
            <span class="logo"></span>
            <span class="page-name">${activeLeagueName}</span>
            <button class="stats-button"><i class="material-icons">assessment</i></button>
            <button class="filter-button"><i class="material-icons">filter_list</i></button>
            <button class="today-button"><i class="material-icons">today</i></button>
            <button class="login-button"><i class="material-icons">account_box</i></button>
        `);

        $('.menu').append(menuItems);
        $hamburgerMenu = $('.hamburger-menu');
        $statsButton = $('.stats-button');
        $filterButton = $('.filter-button');
        $loginButton = $('.login-button');
        $todayButton = $('.today-button');
    };

    const appendSidebarItems = (html) => {
        $('body').append('<div class="sidebar">' + html + '</div>');
        $sidebar = $('.sidebar');
    };

    const getSidebarItemsHTML = (sidebarItems) => {
        let html = '';

        html += '<ul>';

        html += sidebarItems.menuItems.reduce((sidebarHTML, menuItem) => {
            sidebarHTML += '<li>';

            if (menuItem.itemValue && menuItem.itemValue[0]) {
                if (menuItem.menuItems) {
                    sidebarHTML += `<span>${menuItem.itemValue[0]}</span>`;
                } else {
                    sidebarHTML += `<a href="${menuItem.itemValue[1]}">${menuItem.itemValue[0]}</a>`;
                }
            }

            if (menuItem.menuItems) {
                sidebarHTML += getSidebarItemsHTML(menuItem);
            }

            sidebarHTML += '</li>';
            
            return sidebarHTML;
        }, '');
        
        html += '</ul>';

        return html;
    };

    const cleanupHTML = () => {
        const removeEmptyRows = () => {
            $('.matches_table tr:has(th[colspan="4"]:contains(" "))').remove();
        };

        const removeEmptyParagraphs = () => {
            $('p')
                .filter((index, element) => !(Boolean($(element).children().length)))
                .remove();
        };

        const addMainTableContainerClass = () => {
            $('.matches_table').parent().addClass('table_container');
        };

        const setActiveTab = () => {
            $('.eventmenu_table th:has(a:contains("' + activePageName + '"))').addClass('active');
        };

        const addMenuTabsClass = () => {
            $('.eventmenu_table:has(a:contains("' + activePageName + '"))').addClass('tabs');
            $tabs = $('.tabs');
        };

        const removeEmptyTabsRow = () => {
            $('.eventmenu_table tr:has(td[colspan="7"])').remove();
        };

        const moveSeasonsList = () => {
            let newSeasonsHTML = '';

            newSeasonsHTML += '<ul id="seasons-list">';

            $('.idenylink, .idenyaktiv').each((index, element) => {
                var classes = $(element).hasClass('idenyaktiv') ? 'class="active"' : '',
                    menuTag = $(element).get(0).outerHTML.replace('-20', '/');

                newSeasonsHTML += `<li ${classes}>${menuTag}</li>`;
            });

            newSeasonsHTML += '</ul>';

            $('.page-name').after(newSeasonsHTML);
            $seasonsList = $('#seasons-list');
        };

        const removeTextNodesFromBody = () => {
            $('body')
                .contents()
                .filter(function () {
                    return this.nodeType === 3;
                })
                .remove();
        };

        removeEmptyRows();
        removeEmptyParagraphs();
        addMainTableContainerClass();
        setActiveTab();
        addMenuTabsClass();
        removeEmptyTabsRow();
        moveSeasonsList();
        removeTextNodesFromBody();
    };

    const collectMatches = (statsCollector) => {
        const collect = () => {
            const matchesByDate = $('.matches_table tr').toArray().reduce((matchesByDate, row) => {
                const isDateRow = $(row).children('th[colspan="4"]').length;
                const isGameRow = $(row).children('td').length === 4;
                
                let dateString;
                
                if (isDateRow) {
                    dateString = $(row).children('th').html();

                    if (!matchesByDate[dateString]) {
                        matchesByDate[dateString] = [];
                    }
                } else if (isGameRow) {
                    dateString = $(row).prevAll('tr:has(th[colspan="4"]):first').children('th').html();

                    const matchDetails = getMatchDetails($(row).children('td'));
                    
                    matchesByDate[dateString].push(matchDetails);

                    if (matchDetails.result.scores) {
                        statsCollector.matchStatsCollector.collect(matchDetails.id);
                    }
                }
                
                return matchesByDate;
            }, {});

            statsCollector.individualStatsCollector.collect();
            
            return matchesByDate;
        };

        const getMatchDetails = ($matchRow) => {
            const $homeTeamCell = $matchRow.eq(0);
            const $awayTeamCell = $matchRow.eq(1);
            const $locationCell = $matchRow.eq(2);
            const $resultCell = $matchRow.eq(3);
            const details = {
                id: getMatchId($resultCell),
                homeTeam: getTeamDetails($homeTeamCell),
                awayTeam: getTeamDetails($awayTeamCell),
                location: getLocationDetails($locationCell),
                result: getResultDetails($resultCell),
                winner: null
            };

            collectTeam($homeTeamCell);
            collectTeam($awayTeamCell);
            
            if (details.result.scores) {
                if (details.result.scores.homeScore > details.result.scores.awayScore) {
                    details.winner = details.homeTeam.name;
                } else if (details.result.scores.homeScore < details.result.scores.awayScore) {
                    details.winner = details.awayTeam.name;
                }
            }

            return details;
        };

        const getMatchId = ($resultCell) => {
            const matchDetailsLink = $resultCell.find('a').attr('href');

            return Number(matchDetailsLink.substr(matchDetailsLink.indexOf('mid=') + 4));
        };

        const getTeamDetails = ($teamCell) => {
            const $teamLink = $teamCell.find('a');
            const link = $teamLink && $teamLink.attr('href'); 
            const teamId = link.substr(link.indexOf('tid=') + 4);

            return {
                id: teamId,
                name: $teamLink.html(),
                link: link
            };
        };

        const getLocationDetails = ($locationCell) => {
            const $locationLink = $locationCell.find('a');

            return {
                name: $locationLink.html(),
                link: $locationLink.attr('href')
            };
        };

        const getResultDetails = ($resultCell) => {
            const endResultHTML = $resultCell.find('b').html();
            const matchDetailsLink = $resultCell.find('a');
            
            let endResultArray;
            let quartersArray;

            if (endResultHTML) {
                endResultArray = endResultHTML.split(':');
                quartersArray = $resultCell.find('b').next('font').html().replace('(', '').replace(')', '').split(',');

                resultDetails = {
                    scores: {
                        homeScore: parseInt(endResultArray[0], 10),
                        awayScore: parseInt(endResultArray[1], 10),
                        quarters: quartersArray
                    },
                    matchDetailsLink: matchDetailsLink.attr('href')
                };
            } else if (matchDetailsLink) {
                resultDetails = {
                    matchDetailsLink: matchDetailsLink.attr('href'),
                    matchTime: matchDetailsLink.html()
                };
            }

            return resultDetails;
        };
        
        const collectTeam = ($teamCell) => {
            const $teamLink = $teamCell.find('a');
            const link = $teamLink && $teamLink.attr('href'); 
            const teamId = link.substr(link.indexOf('tid=') + 4);
            const teamName = $teamLink.html();
            
            if (teamId && !teams.find((team) => team.id === teamId)) {
                teams.push({
                    id: teamId,
                    name: teamName
                });
            }
        };

        return collect();
    };

    const statsCollector = (() => {
        const promises = {
            individualStats: null
        };

        const url = window.location;
        const eventId = url.search.substring(url.search.indexOf('eid') + 4);
        const matchDetailsUrlBase = 'http://www.uzletiliga.hu/eredmenyek/match_details3.php?eid=' + eventId + '&mid=';
        
        const individualStatsCollector = (() => {
            const topScorersPageUrl = 'http://www.uzletiliga.hu/eredmenyek/goals3.php?eid=' + eventId;

            const collect = () => {
                const processResponse = (response) => {
                    const topScorerTables = $(response).find('.goals_table').toArray();
                    
                    return topScorerTables.reduce(reduceTopScorerTables, {});
                };

                const reduceTopScorerTables = (topScorers, table) => {
                    $(table).find('tr').each((index, tableRow) => {
                        const topScorerData = getTopScorerData(tableRow);

                        if (topScorerData) {
                            if (!topScorers[topScorerData.teamName]) {
                                topScorers[topScorerData.teamName] = [{
                                    name: topScorerData.name,
                                    points: topScorerData.points
                                }];
                            } else {
                                topScorers[topScorerData.teamName].push({
                                    name: topScorerData.name,
                                    points: topScorerData.points
                                });
                            }
                        }
                    });

                    return topScorers;
                };

                const getTopScorerData = (tableRow) => {
                    const $cells = $(tableRow).find('td:not([colspan])');

                    if ($cells.length) {
                        return {
                            name: $cells.eq(0).find('a').html(),
                            teamName: $cells.eq(1).find('a').html(),
                            points: Number($cells.eq(2).find('b').html())
                        };
                    }
                };

                const saveToStorage = (eventStatsResponse) => {
                    chrome.runtime.sendMessage({
                        task: 'eventStats.save',
                        data: eventStatsResponse
                    });
                };

                const loadFromStorage = (eventId) => {
                    return new Promise((resolve, reject) => {
                        chrome.runtime.sendMessage({
                            task: 'eventStats.get',
                            eventId: eventId
                        }, (response) => {
                            if (response && response[eventId]) {
                                resolve(response[eventId]);
                            } else {
                                reject();
                            }
                        });
                    });
                };

                promises.individualStats = loadFromStorage(eventId)
                    .catch(() => {
                        return new Promise((resolve, reject) => {
                            $.get(topScorersPageUrl, (response) => {
                                const processedResponseData = Object.assign(processResponse(response), { id: eventId });
                                let processedResponse = {};

                                processedResponse[String(eventId)] = processedResponseData;
                                
                                saveToStorage(processedResponse);
                                resolve(processedResponseData);
                            });
                        });
                    });
            };

            return {
                collect
            };
        })();

        const matchStatsResponseProcessor = (() => {
            const processResponse = (response) => {
                const $response = $(response);
                const $homeTeamStatsTable = $response.find('.match_details_table:has(h6:contains("Hazai csapat"))');
                const $awayTeamStatsTable = $response.find('.match_details_table:has(h6:contains("Vendég csapat"))');
                const homeTeamName = $homeTeamStatsTable.find('a[href^="team_details"]').html();
                const awayTeamName = $awayTeamStatsTable.find('a[href^="team_details"]').html();
                const $homeRows = getPlayerRows($homeTeamStatsTable);
                const $awayRows = getPlayerRows($awayTeamStatsTable);
                
                if ($homeRows.length || $awayRows.length) {
                    const homeStats = $homeRows.toArray().reduce(playerRowReducer, []);
                    const awayStats = $awayRows.toArray().reduce(playerRowReducer, []);

                    return {
                        isPlayed: true,
                        homeTeamName,
                        homeStats,
                        awayTeamName,
                        awayStats
                    };
                } else {
                    return {
                        isPlayed: false
                    };
                }
            };

            const getPlayerRows = ($teamStatsTable) => {
                return $teamStatsTable.find('tr:has(a[href^="player_details"])');
            };

            const playerRowReducer = (stats, playerRow) => {
                const $row = $(playerRow);
                const $cells = $row.find('td');
                const playerName = $row.find('td:first a').html();
                const quarters = [
                    Number($cells.eq(1).html()) || 0,
                    Number($cells.eq(2).html()) || 0,
                    Number($cells.eq(3).html()) || 0,
                    Number($cells.eq(4).html()) || 0
                ];
                const sumScore = getSumScore(quarters);
                const freeThrowCount = Number($cells.eq(5).html()) || 0;
                const fieldGoalCount = Number($cells.eq(6).html()) || 0;
                const threePointerCount = Number($cells.eq(7).html()) || 0;
                const fouls = Number($cells.eq(9).html()) || 0;

                stats.push({
                    name: playerName.substr(0, playerName.indexOf('&')),
                    quarters: quarters,
                    sumScore: sumScore,
                    fouls: fouls,
                    freeThrowCount: freeThrowCount,
                    fieldGoalCount: fieldGoalCount,
                    threePointerCount: threePointerCount
                });

                return stats;
            };

            const getSumScore = (quarters) => {
                return quarters.reduce((sum, score) => sum += score, 0);
            };

            return {
                processResponse
            };
        })();

        const matchStatsCollector = ((matchStatsResponseProcessor) => {
            const collect = (matchId) => {
                loadFromStorage(matchId)
                    .catch(() => {
                        return new Promise((resolve, reject) => {
                            $.get(matchDetailsUrlBase + matchId, (response) => {
                                const processedResponseData = Object.assign(matchStatsResponseProcessor.processResponse(response), { id: matchId });
                                let processedResponse = {};

                                processedResponse[String(matchId)] = processedResponseData;
                                
                                saveToStorage(processedResponse);
                                resolve(processedResponseData);
                            }).fail(() => {
                                collectMatchStats(matchId);
                            });
                        });
                    })
                    .then(renderMatchStats);
            };

            const saveToStorage = (matchStatsResponse) => {
                chrome.runtime.sendMessage({
                    task: 'matchStats.save',
                    data: matchStatsResponse
                });
            };

            const loadFromStorage = (matchId) => {
                return new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        task: 'matchStats.get',
                        matchId: matchId
                    }, (response) => {
                        if (response && response[matchId]) {
                            resolve(response[matchId]);
                        } else {
                            reject();
                        }
                    });
                });
            };

            const renderMatchStats = (matchStatsResponse) => {
                const $match = $(`.match[data-match-id="${matchStatsResponse.id}"]`);
                const $matchStatsContainer = $match.find('.match-stats-container');
                const $matchStatsToggler = $match.find('.stats-toggler');
                
                $matchStatsToggler.removeClass('loading');

                if (matchStatsResponse.isPlayed) {
                    $matchStatsToggler.addClass('loaded');
                    matchStatsResponse.homeStats.sort(matchStatsSorter);
                    matchStatsResponse.awayStats.sort(matchStatsSorter);
                    $matchStatsContainer.html(getMacthStatsHTML(matchStatsResponse));
                } else {
                    $matchStatsToggler.addClass('inactive');
                    $matchStatsContainer.html('');
                }
            };

            const matchStatsSorter = (a, b) => {
                if (a.sumScore > b.sumScore) {
                    return -1;
                }

                if (a.sumScore < b.sumScore) {
                    return 1;
                }

                return 0;
            };

            const getMacthStatsHTML = (matchStats) => {
                const html = (`
                    <div class="home-stats match-stats">
                        ${getTeamStatsHTML(matchStats.homeTeamName, matchStats.homeStats)}
                    </div>
                    <div class="away-stats match-stats">
                        ${getTeamStatsHTML(matchStats.awayTeamName, matchStats.homeStats)}
                    </div>
                `);

                return html;
            };

            const getTeamStatsHTML = (teamName, teamStats) => {
                let teamStatsHTML = '';

                teamStatsHTML += (`
                    <table class="table">
                        <thead>
                            <tr>
                                <th>${teamName}</th>
                                <th>Q1</th>
                                <th>Q2</th>
                                <th>Q3</th>
                                <th>Q4</th>
                                <th></th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>H</th>
                            </tr>
                        </thead>
                        <tbody>
                `);
                
                teamStatsHTML += teamStats.reduce((teamStatsHTML, playerStat) => {
                    return teamStatsHTML += (`
                        <tr>
                            <td class="player-name">${playerStat.name}</td>
                            ${getQuartersHTML(playerStat.quarters)}
                            <td class="sum-score">${playerStat.sumScore}</td>
                            <td>${playerStat.freeThrowCount}</td>
                            <td>${playerStat.fieldGoalCount}</td>
                            <td>${playerStat.threePointerCount}</td>
                            <td>${playerStat.fouls}</td>
                        </tr>
                    `);
                }, '');

                teamStatsHTML += (`
                        </tbody>
                    </table>
                `);

                return teamStatsHTML;
            };

            const getQuartersHTML = (quarters) => {
                return quarters.reduce((quartersHTML, quarterScore) => {
                    return quartersHTML += (`
                        <td class="quarter-score">${quarterScore}</td>
                    `);
                }, '');
            };

            return {
                collect
            };
        })(matchStatsResponseProcessor);

        return {
            individualStatsCollector,
            matchStatsCollector,
            promises
        };
    })();

    const appendMatches = (matchesData) => {
        let matchesHTML = '';

        const appendDateContainer = (matchesHTML, date) => {
            const matches = matchesData[date];
            const dayTimestamp = Date.parse(date);
            
            const getFinishedClass = (match) => {
                return match.result.scores ? 'finished' : '';
            };

            matchesHTML += '<div class="date-container';
            
            if (dayTimestamp < todayTimestamp) {
                matchesHTML += ' past';
            } else if (dayTimestamp === todayTimestamp) {
                matchesHTML += ' today';
            }

            matchesHTML += '">';

            matchesHTML += '<h3 class="date">' + date + '</h3>';
            matchesHTML += '<ul class="matches">';
            
            matchesHTML += matches.reduce((matchesHTML, match) => {
                matchesHTML += `<li class="match card ${getFinishedClass(match)}" data-match-id="${match.id}">`;
                matchesHTML += getTeamsHTML(match);

                if (match.result.scores) {
                    matchesHTML += '<button class="stats-toggler loading"><i class="material-icons">assessment</i></button>';
                    matchesHTML += getResultHTML(match.result);
                    matchesHTML += getQuartersHTML(match.result.scores.quarters);
                    matchesHTML += (`
                        <div class="match-stats-container"></div>
                    `);
                }

                if (match.result.matchTime) {
                    matchesHTML += getMatchTimeHTML(match.result);
                }
                
                matchesHTML += getLocationHTML(match.location);

                matchesHTML += '</li>';

                return matchesHTML;
            }, '');

            matchesHTML += '</ul>';
            matchesHTML += '</div>';
            
            return matchesHTML;
        };

        const getTeamsHTML = (match) => {
            let teamsHTML = '';

            teamsHTML += '<div class="teams">';
            teamsHTML += '<div class="home team';

            if (match.winner === match.homeTeam.name) {
                teamsHTML += ' winner';
            }

            teamsHTML += '"';
            
            if (match.homeTeam.id) {
                teamsHTML += ` data-team-id="${match.homeTeam.id}"`;
            }
            
            teamsHTML += '>';
            teamsHTML += (
                `<a href="${match.homeTeam.link}">
                    ${match.homeTeam.name}
                </a>`
            );
            teamsHTML += '</div>';
            teamsHTML += '<div class="away team';

            if (match.winner === match.awayTeam.name) {
                teamsHTML += ' winner';
            }

            teamsHTML += '"';
            
            if (match.awayTeam.id) {
                teamsHTML += ` data-team-id="${match.awayTeam.id}"`;
            }
            
            teamsHTML += '>';
            teamsHTML += (
                `<a href="${match.awayTeam.link}">
                    ${match.awayTeam.name}
                </a>`
            );
            teamsHTML += '</div>';
            teamsHTML += '</div>';

            return teamsHTML;
        };

        const getResultHTML = (result) => {
            return (
                `<a class="scores" href="${result.matchDetailsLink}">
                    <span class="home score">${result.scores.homeScore}</span>
                    <span class="away score">${result.scores.awayScore}</span>
                </a>`
            );
        };

        const getQuartersHTML = (quarters) => {
            return (
                `<ul class="quarters">
                    ${quarters.reduce(getQuarterResultHTML, '')}
                </ul>`
            );
        };

        const getQuarterResultHTML = (quartersHTML, quarterResult) => {
            return (
                `${quartersHTML}<li class="result">${quarterResult}</li>`
            );
        };

        const getMatchTimeHTML = (result) => {
            return (
                `<div class="match-time-container">
                    <a href="${result.matchDetailsLink}">
                        <i class="material-icons">schedule</i>
                        <span>${result.matchTime}</span>
                    </a>
                </div>`
            );
        };

        const getLocationHTML = (location) => {
            return (
                `<div class="location-container">
                    <a class="location" href="${location.link}">
                        <i class="material-icons">location_on</i>
                        <span>${location.name}</span>
                    </a>
                </div>`
            );
        };
        
        matchesHTML += '<div id="matches-container" class="sub-page show">';
        
        matchesHTML += Object.keys(matches).reduce(appendDateContainer, '');

        matchesHTML += '</div>';
        $('.tabs:first').after(matchesHTML);
        $matchesContainer = $('#matches-container');
        
        // logger NOT FOR PRODUCTION
        console.log(matches);
    };

    const appendFilter = (teams) => {
        const getTeamSelectorHTML = (teamSelectorsHTML, team) => {
            return (`
                ${teamSelectorsHTML}
                <li>
                    <button class="team-selector active" data-team-id="${team.id}">${team.name}</button>
                </li>
            `);
        };

        const filterHTML = (`
            <div id="filter">
                <div class="main-controls">
                    <button class="show-finished-matches active">végetért meccsek</button>
                    <button class="show-all-teams active">összes csapat</button>
                </div>
                <ul class="team-selector-container scroller">
                    ${teams.reduce(getTeamSelectorHTML, '')}
                </ul>
            </div>
        `);

        $('body').append(filterHTML);
        $filter = $('#filter');
        $showFinishedButton = $('.show-finished-matches');
        $showAllTeamsButton = $('.show-all-teams');
        $teamSelectors = $('.team-selector');
        $filteringButtons = $('#filter button');
    };

    const colorOddRows = (index) => {
        return (index % 2) !== 0 ? 'darker' : '';
    };

    const getOddRowBatchColorer = (batchSize) => {
        return (index) => {
            return (parseInt(index / batchSize, 10) % 2) !== 0 ? 'darker' : '';
        };
    };

    const appendStats = (teams, matches) => {
        const getLeagues = (teams, matches) => {
            return teams.reduce((leagues, team) => {
                Object.keys(matches).forEach((date) => {
                    matches[date].forEach((match) => {
                        const isTeamMatch = match.homeTeam.name === team.name || match.awayTeam.name === team.name;

                        if (isTeamMatch) {
                            const homeTeamLeague = leagues.find((league) => league.teams && (league.teams.indexOf(match.homeTeam.name) > -1));
                            const awayTeamLeague = leagues.find((league) => league.teams && (league.teams.indexOf(match.awayTeam.name) > -1));

                            if (!homeTeamLeague && !awayTeamLeague) {
                                leagues.push({
                                    teams: [match.homeTeam.name, match.awayTeam.name]
                                });
                            } else if (!homeTeamLeague) {
                                awayTeamLeague.teams.push(match.homeTeam.name)
                            } else if (!awayTeamLeague) {
                                homeTeamLeague.teams.push(match.awayTeam.name)
                            }
                        }
                    });
                });

                return leagues;
            }, []);
        };

        const leagues = getLeagues(teams, matches);
        const allTeamsLeague = [{
            name: 'Selejtező',
            teams: teams.map((team) => team.name)
        }];

        const getLeagueStatsHTML = (leagues, matches, getRowGroupClass) => {
            const getTeamStatsHTML = (teamStats, getRowGroupClass) => {
                return teamStats.reduce((html, teamStat, index) => {
                    return html += (`
                        <tr class="${getRowGroupClass(index)}">
                            <td>${teamStat.teamName}</td>
                            <td>${teamStat.matchCount}</td>
                            <td>${teamStat.winCount}</td>
                            <td>${teamStat.lossCount}</td>
                            <td>${teamStat.scoredPointsCount}</td>
                            <td>${teamStat.againstPointsCount}</td>
                            <td>${teamStat.scoreDifference}</td>
                            <td>${teamStat.points}</td>
                        </tr>
                    `);
                }, '');
            };

            const rowColoringFunction = getRowGroupClass || colorOddRows;

            return leagues.reduce((leagueStatsHTML, league) => {
                const teamStats = getTeamStats(league.teams, matches).sort(statSorter);

                if (league.name) {
                    leagueStatsHTML += `<h3 class="stats-title">${league.name}</h3>`;
                }

                return leagueStatsHTML += (`
                    <table class="stats-table table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Mérk.</th>
                                <th>Győz.</th>
                                <th>Ver.</th>
                                <th>Dob.</th>
                                <th>Kap.</th>
                                <th>Kül.</th>
                                <th>Pont</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getTeamStatsHTML(teamStats, rowColoringFunction)}
                        </tbody>
                    </table>
                `);
            }, '');
        };

        const getTeamStats = (teams, matches) => {
            const teamStatCounter = (teamName, matches, counter) => {
                return Object.keys(matches).reduce((count, date) => {
                    return count += matches[date].reduce(counter.bind(null, teamName), 0);
                }, 0);
            };

            const matchCounter = (teamName, matchCount, match) => {
                const isMatchEnded = Boolean(match.winner);
                const hasPlayed = match.homeTeam.name === teamName || match.awayTeam.name === teamName;

                return matchCount += Number(isMatchEnded && hasPlayed);
            };

            const winCounter = (teamName, winCount, match) => {
                return winCount += Number(match.winner === teamName);
            };

            const lossCounter = (teamName, lossCount, match) => {
                const isMatchEnded = Boolean(match.winner);
                const hasPlayed = match.homeTeam.name === teamName || match.awayTeam.name === teamName;
                const isWinner = match.winner === teamName;

                return lossCount += Number(isMatchEnded && hasPlayed && !isWinner);
            };

            const getScoredPointsCounter = (collectPointsAgainst) => {
                return (teamName, scoredPoints, match) => {
                    const isMatchEnded = Boolean(match.winner);
                    const hasPlayed = match.homeTeam.name === teamName || match.awayTeam.name === teamName;
                    
                    let teamScore = 0;

                    if (isMatchEnded && hasPlayed) {
                        const isHomeTeam = match.homeTeam.name === teamName;

                        if (collectPointsAgainst) {
                            teamScore = isHomeTeam ? match.result.scores.awayScore : match.result.scores.homeScore;
                        } else {
                            teamScore = isHomeTeam ? match.result.scores.homeScore : match.result.scores.awayScore;
                        }
                    }

                    return scoredPoints += teamScore;
                };
            };

            return teams.map((team) => {
                const details = {
                    teamName: team,
                    matchCount: teamStatCounter(team, matches, matchCounter),
                    winCount: teamStatCounter(team, matches, winCounter),
                    lossCount: teamStatCounter(team, matches, lossCounter),
                    scoredPointsCount: teamStatCounter(team, matches, getScoredPointsCounter()),
                    againstPointsCount: teamStatCounter(team, matches, getScoredPointsCounter(true)),
                    scoreDifference: null,
                    points: null
                };

                details.scoreDifference = details.scoredPointsCount - details.againstPointsCount;
                details.points = (details.winCount * 2) + details.lossCount;

                return details;
            });
        };

        const statSorter = (a, b) => {
            if (a.points > b.points || a.points === b.points && a.scoreDifference > b.scoreDifference) {
                return -1;
            }

            if (a.points < b.points || a.points === b.points && a.scoreDifference < b.scoreDifference) {
                return 1;
            }

            return 0;
        };

        const seasonLeagueTeamCount = 8;
            
        const statsHTML = (`
            <div id="stats" class="sub-page">
                <nav class="tabmenu">
                    <a href="#team-stats" for="team-stats" class="active">Csapat statisztikák</a>
                    <a href="#individual-stats" for="individual-stats">Egyéni statisztikák</a>
                    <a href="#all-team-stats" for="all-team-stats">Liga statisztikák</a>
                </nav>
                <div id="team-stats" class="tab card active">
                    ${getLeagueStatsHTML(leagues, matches)}
                </div>
                <div id="individual-stats" class="tab card"></div>
                <div id="all-team-stats" class="tab card">
                    ${getLeagueStatsHTML(allTeamsLeague, matches, getOddRowBatchColorer(seasonLeagueTeamCount))}
                </div>
            </div>
        `);

        const attachEventHandlers = () => {
            $('.tabmenu a').on('click', (event) => {
                const $tabNav = $(event.currentTarget);
                const targetTabSelector = '#' + $tabNav.attr('for');

                $('.tabmenu a').removeClass('active');
                $tabNav.addClass('active');
                
                $('.tab')
                    .removeClass('active')
                    .filter(targetTabSelector)
                    .addClass('active');

                event.preventDefault();

                return false;
            });
        };

        $('#matches-container').after(statsHTML);
        $stats = $('#stats');
        $individualStats = $('#individual-stats');
        attachEventHandlers();
    };

    const renderIndividualStats = (individualStats, sortByTeamOrder) => {
        const individualStatsArray = Object.keys(individualStats).reduce((html, teamName) => {
            individualStats[teamName].forEach((playerStat) => {
                html.push({
                    name: playerStat.name,
                    teamName: teamName,
                    points: playerStat.points
                });
            });

            return html;
        }, []);

        const getIndividualStatsHTML = (individualStatsArray, sortByTeamOrder) => {
            const individualStatsSorters = {
                sortByPoints(a, b) {
                    if (a.points > b.points) {
                        return -1;
                    }

                    if (a.points < b.points) {
                        return 1;
                    }

                    return 0;
                },
                sortByTeamAndPoints(order, a, b) {
                    const teamNameA = a.teamName.toLowerCase();
                    const teamNameB = b.teamName.toLowerCase();
                    const isASC = order === 'asc';
                    const isDESC = order === 'desc';
                    const isWrongNameOrder = (isASC && teamNameA < teamNameB) || (isDESC && teamNameA > teamNameB);
                    const isRightNameOrder = (isASC && teamNameA > teamNameB) || (isDESC && teamNameA < teamNameB);
                    const isSameTeamName = teamNameA === teamNameB;
                    const isWrongPointsOrder = a.points > b.points;
                    const isRightPointsOrder = a.points < b.points;

                    if (isWrongNameOrder || isSameTeamName && isWrongPointsOrder) {
                        return -1;
                    }

                    if (isRightNameOrder || isSameTeamName && isRightPointsOrder) {
                        return 1;
                    }

                    return 0;
                }
            };

            const statsSorter = sortByTeamOrder ? individualStatsSorters.sortByTeamAndPoints.bind(null, sortByTeamOrder) : individualStatsSorters.sortByPoints;

            return individualStatsArray.sort(statsSorter).reduce((html, playerStat, index) => {
                return html += (`
                    <tr class="${colorOddRows(index)}">
                        <td><b>${playerStat.name}</b></td>
                        <td class="align-left">${playerStat.teamName}</td>
                        <td>${playerStat.points}</td>
                    </tr>
                `);
            }, '');
        };

        const attachIndividualStatsEvents = ($teamSorter) => {
            $teamSorter.on('click', (event) => {
                const $element = $(event.currentTarget);

                switch ($element.attr('data-order')) {
                    case 'asc':
                        setTimeout(renderIndividualStats.bind(null, individualStats, 'desc'), 0);

                        break;
                    case 'desc':
                        setTimeout(renderIndividualStats.bind(null, individualStats), 0);

                        break;
                    default:
                        setTimeout(renderIndividualStats.bind(null, individualStats, 'asc'), 0);

                        break;
                }
            });
        };

        sortByTeamOrder = sortByTeamOrder || '';

        $individualStats.html(`
            <h3 class="stats-title">Legjobb dobók</h3>
            <table class="stats-table table">
                <thead>
                    <tr>
                        <th>Név</th>
                        <th class="sort-by-team align-left" data-order="${sortByTeamOrder}">
                            <span class="sortable">Csapat</span><i class="material-icons"></i>
                        </th>
                        <th data-order="desc">
                            <span>Pontok</span><i class="material-icons"></i>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${getIndividualStatsHTML(individualStatsArray, sortByTeamOrder)}
                </tbody>
            </table>
        `);
        attachIndividualStatsEvents($('.sort-by-team'));
    };

    const setActiveTeamIds = () => {
        activeTeamIds = $('.team-selector.active').map((index, element) => $(element).attr('data-team-id')).toArray();
    };

    const attachEventHandlers = () => {
        const toggleMatches = () => {
            const getTeamIdsFromMatch = ($match) => {
                return $match.find('.team').map((index, element) => $(element).attr('data-team-id')).toArray();
            };

            const filterMatch = (index, matchElement) => {
                const $match = $(matchElement);
                const matchTeamIds = getTeamIdsFromMatch($match);
                const areTeamsFiltered = !(matchTeamIds.some((matchTeamId) => activeTeamIds.indexOf(matchTeamId) > -1));
                const isTimeFiltered = $showFinishedButton.hasClass('active') ? false : $match.hasClass('finished');

                $match.toggleClass('hidden', areTeamsFiltered || isTimeFiltered);
            };

            const hideEmptyDateContainers = () => {
                $('.date-container')
                    .each(function () {
                        const hasVisibleMatch = $(this).find('.match:not(.hidden)').length;
                        
                        $(this).toggleClass('hidden', !hasVisibleMatch);
                    });
            };

            $('.match').each(filterMatch);
            
            hideEmptyDateContainers();
        };

        const setFilterButtonState = () => {
            const isFiltered = Boolean($('#filter button:not(.active)').length);
            
            $filterButton.toggleClass('filtered', isFiltered);
        };

        $hamburgerMenu.on('click', function () {
            $('body').toggleClass('sidebarred');
            $(this).toggleClass('active');
        });
        $statsButton.on('click', function () {
            $('body').toggleClass('stats-page-active');
            $(this).toggleClass('active');

            if ($(this).hasClass('active')) {
                $matchesContainer.removeClass('show');
            } else {
                $matchesContainer.addClass('show');
            }

            $stats.toggleClass('show');
        });
        $loginButton.on('click', function () {
            $('#login').toggleClass('open');
            $(this).toggleClass('active');
        });
        $todayButton.on('click', function () {
            const $today = $('.today');
            const $scrollTarget = $today.length ? $today : $('.date-container:not(.past):first');
            
            let todayOffset;

            if ($scrollTarget.length) {
                todayOffset = $scrollTarget.get(0).offsetTop - Number($('body').css('padding-top').replace('px', ''));

                $('.sub-page.show:not(:animated)')
                    .animate({ scrollTop: todayOffset }, 1000);
            }
        });
        $filterButton.on('click', function () {
            $filter.toggleClass('open');
            $(this).toggleClass('active');
        });
        $showFinishedButton.on('click', function () {
            $(this).toggleClass('active');
            toggleMatches();
        });
        $teamSelectors.on('click', function () {
            $(this).toggleClass('active');
            setActiveTeamIds();
            toggleMatches();
        });
        $showAllTeamsButton.on('click', function () {
            $(this).toggleClass('active');
            $('.team-selector').toggleClass('active', $(this).hasClass('active'));
            setActiveTeamIds();
            toggleMatches();
        });
        $filteringButtons.on('click', function () {
            setFilterButtonState();
        });
        $('.sub-page').on('mousedown wheel DOMMouseScroll mousewheel keyup', () => {
            $('.sub-page.show').stop(true, true);
        });
        $('.stats-toggler').on('click', (event) => {
            const $button = $(event.currentTarget);

            $button.toggleClass('active');
            $button.parents('.match:first').toggleClass('show-stats');
        });
    };

    init(sidebarItems);
};

const scriptLoader = (redesigner) => {
    const script = document.createElement('script');

    script.src = chrome.extension.getURL('js/injected-script.js');
    (document.head || document.documentElement).appendChild(script);

    script.onload = () => {
        script.parentNode.removeChild(script);
    };

    document.addEventListener('scriptInjected', (event) => {
        redesigner(event.detail);
    });
};

scriptLoader(redesigner);
