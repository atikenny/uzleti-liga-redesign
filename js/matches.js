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
        removeTextNodesFromBody();
        matches = collectMatches();
        appendMatches(matches);
        teams.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        appendFilter(teams);
        attachEventHandlers();
    };

    const appendMetaTags = () => {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
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

    const appendFilter = (teams) => {
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
    
    const getTeamSelectorHTML = (teamSelectorsHTML, team) => {
        return (`
            ${teamSelectorsHTML}
            <li>
                <button class="team-selector active" data-team-id="${team.id}">${team.name}</button>
            </li>
        `);
    };

    const cleanupHTML = () => {
        removeEmptyRows();
        removeEmptyParagraphs();
        addMainTableContainerClass();
        setActiveTab();
        addMenuTabsClass();
        fixTabsOnScroll();
        removeEmptyTabsRow();
        moveSeasonsList();
    };

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

    const fixTabsOnScroll = () => {
        let timer;

        const debouncedScrollHandler = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                $tabs.toggleClass('fixed', Boolean($(window).scrollTop() >= 100));
            }, 0);

            return timer;
        };

        $(window).scroll(debouncedScrollHandler);
        debouncedScrollHandler();
    };

    const removeEmptyTabsRow = () => {
        $('.eventmenu_table tr:has(td[colspan="7"])').remove();
    };

    const moveSeasonsList = () => {
        let newSeasonsHTML = '';

        newSeasonsHTML += '<ul id="seasons-list">';

        $('.idenylink,.idenyaktiv').each(function () {
            newSeasonsHTML += '<li>';
            newSeasonsHTML += $(this).get(0).outerHTML;
            newSeasonsHTML += '</li>';
        });

        newSeasonsHTML += '</ul>';

        $('.tabs:first').after(newSeasonsHTML);
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

    const collectMatches = () => {
        const collect = () => {
            const gamesByDate = $('.matches_table tr').toArray().reduce((gamesByDate, row) => {
                const isDateRow = $(row).children('th[colspan="4"]').length;
                const isGameRow = $(row).children('td').length === 4;
                
                let dateString;
                
                if (isDateRow) {
                    dateString = $(row).children('th').html();

                    if (!gamesByDate[dateString]) {
                        gamesByDate[dateString] = [];
                    }
                } else if (isGameRow) {
                    dateString = $(row).prevAll('tr:has(th[colspan="4"]):first').children('th').html();

                    gamesByDate[dateString].push(getGameDetails($(row).children('td')));
                }
                
                return gamesByDate;
            }, {});
            
            return gamesByDate;
        };

        const getGameDetails = ($gamesRow) => {
            const details = {
                homeTeam: getTeamDetails($gamesRow.eq(0)),
                awayTeam: getTeamDetails($gamesRow.eq(1)),
                location: getLocationDetails($gamesRow.eq(2)),
                result: getResultDetails($gamesRow.eq(3)),
                winner: null
            };

            collectTeam($gamesRow.eq(0));
            collectTeam($gamesRow.eq(1));
            
            if (details.result.scores) {
                if (details.result.scores.homeScore > details.result.scores.awayScore) {
                    details.winner = details.homeTeam.name;
                } else if (details.result.scores.homeScore < details.result.scores.awayScore) {
                    details.winner = details.awayTeam.name;
                }
            }

            return details;
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

    const appendMatches = (matches) => {
        let matchesHTML = '';

        const appendDateContainer = (matchesHTML, date) => {
            const games = matches[date];
            const dayTimestamp = Date.parse(date);

            matchesHTML += '<div class="date-container';
            
            if (dayTimestamp < todayTimestamp) {
                matchesHTML += ' past';
            } else if (dayTimestamp === todayTimestamp) {
                matchesHTML += ' today';
            }

            matchesHTML += '">';

            matchesHTML += '<h3 class="date">' + date + '</h3>';
            matchesHTML += '<ul class="matches">';
            
            games.forEach((game) => {
                matchesHTML += '<li class="match card';
                
                if (game.result.scores) {
                    matchesHTML += ' finished';
                }
                
                matchesHTML += '">';
                matchesHTML += getTeamsHTML(game);

                if (game.result.scores) {
                    matchesHTML += getResultHTML(game.result);
                    matchesHTML += getQuartersHTML(game.result.scores.quarters);
                }

                if (game.result.matchTime) {
                    matchesHTML += getMatchTimeHTML(game.result);
                }
                
                matchesHTML += getLocationHTML(game.location);

                matchesHTML += '</li>';
            });

            matchesHTML += '</ul>';
            matchesHTML += '</div>';
            
            return matchesHTML;
        };
        
        matchesHTML += '<div id="matches-container">';
        
        matchesHTML += Object.keys(matches).reduce(appendDateContainer, '');

        matchesHTML += '</div>';
        $seasonsList.after(matchesHTML);
        
        // logger NOT FOR PRODUCTION
        console.log(matches);
    };

    const getTeamsHTML = (game) => {
        let teamsHTML = '';

        teamsHTML += '<div class="teams">';
        teamsHTML += '<div class="home team';

        if (game.winner === game.homeTeam.name) {
            teamsHTML += ' winner';
        }

        teamsHTML += '"';
        
        if (game.homeTeam.id) {
            teamsHTML += ` data-team-id="${game.homeTeam.id}"`;
        }
        
        teamsHTML += '>';
        teamsHTML += (
            `<a href="${game.homeTeam.link}">
                ${game.homeTeam.name}
            </a>`
        );
        teamsHTML += '</div>';
        teamsHTML += '<div class="away team';

        if (game.winner === game.awayTeam.name) {
            teamsHTML += ' winner';
        }

        teamsHTML += '"';
        
        if (game.awayTeam.id) {
            teamsHTML += ` data-team-id="${game.awayTeam.id}"`;
        }
        
        teamsHTML += '>';
        teamsHTML += (
            `<a href="${game.awayTeam.link}">
                ${game.awayTeam.name}
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

    const attachEventHandlers = () => {
        $hamburgerMenu.on('click', function () {
            $('body').toggleClass('sidebarred');
            $(this).toggleClass('active');
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
                todayOffset = $scrollTarget.offset().top - $('.menu').height();

                $('html:not(:animated),body:not(:animated)')
                    .animate({ scrollTop: todayOffset }, 1500);
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
    };
    
    const toggleMatches = () => {
        $('.match').each(filterMatch);
        
        hideEmptyDateContainers();
    };

    const setActiveTeamIds = () => {
        activeTeamIds = $('.team-selector.active').map((index, element) => $(element).attr('data-team-id')).toArray();
    };

    const filterMatch = (index, matchElement) => {
        const $match = $(matchElement);
        const matchTeamIds = getTeamIdsFromMatch($match);
        const areTeamsFiltered = !(matchTeamIds.some((matchTeamId) => activeTeamIds.indexOf(matchTeamId) > -1));
        const isTimeFiltered = $showFinishedButton.hasClass('active') ? false : $match.hasClass('finished');

        $match.toggleClass('hidden', areTeamsFiltered || isTimeFiltered);
    };

    const getTeamIdsFromMatch = ($match) => {
        return $match.find('.team').map((index, element) => $(element).attr('data-team-id')).toArray();
    };
    
    const hideEmptyDateContainers = () => {
        $('.date-container')
            .each(function () {
                const hasVisibleMatch = $(this).find('.match:not(.hidden)').length;
                
                $(this).toggleClass('hidden', !hasVisibleMatch);
            });
    };
    
    const setFilterButtonState = () => {
        const isFiltered = Boolean($('#filter button:not(.active)').length);
        
        $filterButton.toggleClass('filtered', isFiltered);
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
