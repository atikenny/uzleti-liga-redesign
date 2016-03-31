var script = document.createElement('script');

script.src = chrome.extension.getURL('js/injected-script.js');
(document.head || document.documentElement).appendChild(script);

script.onload = function () {
    script.parentNode.removeChild(script);
};

document.addEventListener('scriptInjected', function (event) {
    redesigner(event.detail);
});

function redesigner(sidebarItems) {
    var activePageName = $('.lap').html(),
        activeLeagueName = $('.eventmenu_table h2').html(),
        hamburgerMenuIconHTML = '<svg width="24px" height="24px" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"></path></svg>',
        $hamburgerMenu,
        $sidebar,
        $seasonsList,
        $loginButton,
        $todayButton,
        $filterButton,
        $filter,
        todayTimestamp = Date.parse((new Date()).toISOString().substr(0, 10));

    function init(sidebarItems) {
        appendMetaTags();
        appendMenuItems();
        appendSidebarItems(getSidebarItemsHTML(sidebarItems));
        appendFilter();
        cleanupHTML();
        removeTextNodesFromBody();
        appendMatches(collectMatches());
        attachEventHandlers();
    }

    function appendMetaTags() {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    }

    function getSidebarItemsHTML(sidebarItems) {
        var html = '';

        html += '<ul>';

        sidebarItems.menuItems.forEach(function (menuItem) {
            html += '<li>';

            if (menuItem.itemValue && menuItem.itemValue[0]) {
                if (menuItem.menuItems) {
                    html += '<span>' + menuItem.itemValue[0] + '</span>';
                } else {
                    html += '<a href="' + menuItem.itemValue[1] + '">' + menuItem.itemValue[0] + '</a>';
                }
            }

            if (menuItem.menuItems) {
                html += getSidebarItemsHTML(menuItem);
            }

            html += '</li>';
        });
        
        html += '</ul>';

        return html;
    }

    function appendMenuItems() {
        var menuItems = '';

        menuItems += '<button class="hamburger-menu">' + hamburgerMenuIconHTML + '</button>';
        menuItems += '<span class="logo"></span>';
        menuItems += '<span class="page-name">' + activeLeagueName + '</span>';
        menuItems += '<button class="filter-button">szűrés</button>';
        menuItems += '<button class="today-button"></button>';
        menuItems += '<button class="login-button">belépés</button>';

        $('.menu').append(menuItems);
        $hamburgerMenu = $('.hamburger-menu');
        $filterButton = $('.filter-button');
        $loginButton = $('.login-button');
        $todayButton = $('.today-button');
    }

    function appendSidebarItems(html) {
        $('body').append('<div class="sidebar">' + html + '</div>');
        $sidebar = $('.sidebar');
    }

    function appendFilter() {
        var filterHTML = '';

        $('body').append(filterHTML);
    }

    function cleanupHTML() {
        removeEmptyRows();
        addMainTableContainerClass();
        setActiveTab();
        addMenuTabsClass();
        removeEmptyTabsRow();
        moveSeasonsList();
    }

    function removeEmptyRows() {
        $('.matches_table tr:has(th[colspan="4"]:contains(" "))').remove();
    }

    function addMainTableContainerClass() {
        $('.matches_table').parent().addClass('table_container');
    }

    function setActiveTab() {
        $('.eventmenu_table th:has(a:contains("' + activePageName + '"))').addClass('active');
    }

    function addMenuTabsClass() {
        $('.eventmenu_table:has(a:contains("' + activePageName + '"))').addClass('tabs');
    }

    function removeEmptyTabsRow() {
        $('.eventmenu_table tr:has(td[colspan="7"])').remove();
    }

    function moveSeasonsList() {
        var newSeasonsHTML = '';

        newSeasonsHTML += '<ul id="seasons-list">';

        $('.idenylink,.idenyaktiv').each(function () {
            newSeasonsHTML += '<li>';
            newSeasonsHTML += $(this).get(0).outerHTML;
            newSeasonsHTML += '</li>';
        });

        newSeasonsHTML += '</ul>';

        $('.tabs:first').after(newSeasonsHTML);
        $seasonsList = $('#seasons-list');
    }

    function removeTextNodesFromBody() {
        $('body')
            .contents()
            .filter(function () {
                return this.nodeType === 3;
            })
            .remove();
    }

    function collectMatches() {
        var gamesByDate = {};

        $('.matches_table tr').each(function () {
            var isDateRow = $(this).children('th[colspan="4"]').length,
                isGameRow = $(this).children('td').length === 4,
                dateString;
            
            if (isDateRow) {
                dateString = $(this).children('th').html();

                if (!gamesByDate[dateString]) {
                    gamesByDate[dateString] = [];
                }
            } else if (isGameRow) {
                dateString = $(this).prevAll('tr:has(th[colspan="4"]):first').children('th').html();

                gamesByDate[dateString].push(getGameDetails($(this).children('td')));
            }
        });

        function getGameDetails($gamesRow) {
            var details = {
                    homeTeam: getTeamDetails($gamesRow.eq(0)),
                    awayTeam: getTeamDetails($gamesRow.eq(1)),
                    location: getLocationDetails($gamesRow.eq(2)),
                    result: getResultDetails($gamesRow.eq(3)),
                    winner: null
                };

            if (details.result.scores) {
                if (details.result.scores.homeScore > details.result.scores.awayScore) {
                    details.winner = details.homeTeam.name;
                } else if (details.result.scores.homeScore < details.result.scores.awayScore) {
                    details.winner = details.awayTeam.name;
                }
            }

            return details;
        }

        function getTeamDetails($teamCell) {
            var $temaLink = $teamCell.find('a');

            return {
                name: $temaLink.html(),
                link: $temaLink.attr('href')
            };
        }

        function getLocationDetails($locationCell) {
            var $locationLink = $locationCell.find('a');

            return {
                name: $locationLink.html(),
                link: $locationLink.attr('href')
            };
        }

        function getResultDetails($resultCell) {
            var endResultHTML = $resultCell.find('b').html(),
                matchDetailsLink = $resultCell.find('a'),
                endResultArray,
                quartersArray;

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
        }

        return gamesByDate;
    }

    function appendMatches(matches) {
        var matchesHTML = '';

        matchesHTML += '<div id="matches-container">';

        Object.keys(matches).forEach(appendDateContainer);

        function appendDateContainer(date) {
            var games = matches[date],
                dayTimestamp = Date.parse(date);

            matchesHTML += '<div class="date-container';
            
            if (dayTimestamp < todayTimestamp) {
                matchesHTML += ' past';
            } else if (dayTimestamp === todayTimestamp) {
                matchesHTML += ' today';
            }

            matchesHTML += '">';

            matchesHTML += '<h3 class="date">' + date + '</h3>';
            matchesHTML += '<ul class="matches">';
            
            games.forEach(function (game) {
                matchesHTML += '<li class="card">';
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
        }

        matchesHTML += '</div>';
        $seasonsList.after(matchesHTML);
        console.log(matches);
    }

    function getTeamsHTML(game) {
        var teamsHTML = '';

        teamsHTML += '<div class="teams">';
        teamsHTML += '<div class="home team';

        if (game.winner === game.homeTeam.name) {
            teamsHTML += ' winner';
        }

        teamsHTML += '">';
        teamsHTML += '<a href="' + game.homeTeam.link + '">';
        teamsHTML += game.homeTeam.name;
        teamsHTML += '</a>';
        teamsHTML += '</div>';
        teamsHTML += '<div class="away team';

        if (game.winner === game.awayTeam.name) {
            teamsHTML += ' winner';
        }

        teamsHTML += '">';
        teamsHTML += '<a href="' + game.awayTeam.link + '">';
        teamsHTML += game.awayTeam.name;
        teamsHTML += '</a>';
        teamsHTML += '</div>';
        teamsHTML += '</div>';

        return teamsHTML;
    }

    function getResultHTML(result) {
        return (
            `<a class="scores" href="${result.matchDetailsLink}">
                <span class="home score">${result.scores.homeScore}</span>
                <span class="away score">${result.scores.awayScore}</span>
            </a>`
        );
    }

    function getQuartersHTML(quarters) {
        return (
            `<ul class="quarters">
                ${quarters.reduce(getQuarterResultHTML, '')}
            </ul>`
        );
    }

    function getQuarterResultHTML(quartersHTML, quarterResult) {
        return (
            `${quartersHTML}<li class="result">${quarterResult}</li>`
        );
    }

    function getMatchTimeHTML(result) {
        return (
            `<div class="match-time-container">
                <a class="clock-icon" href="${result.matchDetailsLink}">
                    ${result.matchTime}
                </a>
            </div>`
        );
    }

    function getLocationHTML(location) {
        return (
            `<div class="location-container">
                <a class="location map-icon" href="${location.link}">
                    ${location.name}
                </a>
            </div>`
        );
    }

    function attachEventHandlers() {
        $hamburgerMenu.on('click', function () {
            $('body').toggleClass('sidebarred');
            $(this).toggleClass('active');
        });
        $loginButton.on('click', function () {
            $('#login').toggleClass('open');
            $(this).toggleClass('active');
        });
        $todayButton.on('click', function () {
            var todayOffset = $('.today').offset().top - $('.menu').height();

            $('html:not(:animated),body:not(:animated)')
                .animate({ scrollTop: todayOffset }, 1500);
        });
        $filterButton.on('click', function () {
            $filter.toggleClass('open');
            $(this).toggleClass('active');
        });
    }

    init(sidebarItems);
}
