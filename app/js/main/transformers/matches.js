const mapMatchesToDates = ({ matches, teams }) => {
    return matches.reduce((dates, match) => {
        const matchDay = getDayFromDate(match.date);
        const date = dates.find(date => date.day === matchDay);
        
        Object.assign(match.homeTeam, getTeamDetails(match.homeTeam.id, teams));
        Object.assign(match.awayTeam, getTeamDetails(match.awayTeam.id, teams));

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
