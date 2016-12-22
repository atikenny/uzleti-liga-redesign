const mapMatchesToDates = ({ matches, teams }) => {
    return matches.reduce((dates, match) => {
        const matchDay = getDayFromDate(match.date);
        const date = dates.find(date => date.day === matchDay);
        
        Object.assign(match.homeTeam, getTeamDetails(match.homeTeam.id, teams), getPlayersStats(match.homeTeam.players));
        Object.assign(match.awayTeam, getTeamDetails(match.awayTeam.id, teams), getPlayersStats(match.awayTeam.players));

        match.results = getMatchResults(match);
        match.time = getTimeFromDate(match.date);

        if (date) {
            date.matches.push(match);
        } else {
            dates.push({
                day: matchDay,
                matches: [match]
            });
        }

        return dates;
    }, []);
};

const getDayFromDate = (date) => {
    return date.substr(0, 10);
};

const getTimeFromDate = (date) => {
    return date.substr(11, 5);
};

const getTeamDetails = (teamId, teams) => {
    return teams.find(team => teamId === team.id);
};

const getPlayersStats = (players) => {
    return {
        players: players.map(extendPlayerStats)
    };
};

const extendPlayerStats = (player) => {
    if (player.stats) {
        return Object.assign({}, player, {
            stats: Object.assign({}, player.stats, {
                sumScore: player.stats.periods.reduce(toPlayerScoreSum, 0),
                periods: player.stats.periods.map(extendPlayerPeriodStats),
                freeThrowCount: player.stats.periods.reduce(toPlayerFreeThrowCount, 0),
                fieldGoalCount: player.stats.periods.reduce(toPlayerFieldGoalCount, 0),
                threePointerCount: player.stats.periods.reduce(toPlayerThreePointerCount, 0)
            })
        });
    } else {
        return player;
    }
};

const extendPlayerPeriodStats = (periodStats) => {
    return Object.assign({}, periodStats, {
        scoreSum: periodStats.scores.reduce(toPlayerPeriodScoreSum, 0)
    });
};

const toPlayerScoreCount = (scoreToCount, count, playerPeriod) => {
    return count + playerPeriod.scores.filter(periodScore => periodScore === scoreToCount).length;
};

const toPlayerFreeThrowCount = toPlayerScoreCount.bind(null, 1);
const toPlayerFieldGoalCount = toPlayerScoreCount.bind(null, 2);
const toPlayerThreePointerCount = toPlayerScoreCount.bind(null, 3);

const getMatchResults = (match) => {
    const hasResults = match.homeTeam.players.some(player => player.stats) || match.awayTeam.players.some(player => player.stats);

    if (hasResults) {
        const homeScore = match.homeTeam.players.reduce(toTeamScoreSum, 0);
        const awayScore = match.awayTeam.players.reduce(toTeamScoreSum, 0);

        return {
            scores: {
                home: homeScore,
                away: awayScore
            },
            winnerTeamId: homeScore > awayScore ? match.homeTeam.id : match.awayTeam.id,
            periodScores: getPeriodScores(match)
        };
    }
};

const toTeamScoreSum = (scoreSum, player) => {
    return player.stats.periods.reduce(toPlayerScoreSum, 0) + scoreSum;
};

const toPlayerScoreSum = (playerScoreSum, periodStat) => {
    return playerScoreSum + periodStat.scores.reduce(toPlayerPeriodScoreSum, 0);
};

const toPlayerPeriodScoreSum = (playerPeriodScoreSum, periodScore) => {
    return playerPeriodScoreSum + periodScore;
};

const getPeriodScores = (match) => {
    const homeTeamPeriodScores = match.homeTeam.players.reduce(toPeriodScores, []);
    const awayTeamPeriodScores = match.awayTeam.players.reduce(toPeriodScores, []);

    return homeTeamPeriodScores.map((homeTeamPeriodScore, index) => {
        return {
            home: homeTeamPeriodScore,
            away: awayTeamPeriodScores[index]
        };
    });
};

const toPeriodScores = (periodScores, player) => {
    player.stats.periods.forEach((playerPeriodStat, index) => {
        let periodScore = periodScores[index];
        const playerPeriodScore = playerPeriodStat.scores.reduce(toPlayerPeriodScoreSum, 0);

        if (periodScore) {
            periodScore += playerPeriodScore;
        } else {
            periodScores.push(playerPeriodScore);
        }
    });

    return periodScores;
};

export const mapEventData = (eventData) => {
    return Object.assign({}, eventData, {
        dates: mapMatchesToDates(eventData)
    });
};
