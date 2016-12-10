const mapMatchesToDates = ({ matches, teams }) => {
    return matches.reduce((dates, match) => {
        const matchDay = getDayFromDate(match.date);
        const date = dates.find(date => date.day === matchDay);
        
        extendMatchWithTeamDetails(match, teams);

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
    return date.substring(0, 10);
};

const extendMatchWithTeamDetails = (match, teams) => {
    match.homeTeam = Object.assign({}, match.homeTeam, teams.find(team => match.homeTeam.id === team.id));
    match.awayTeam = Object.assign({}, match.awayTeam, teams.find(team => match.awayTeam.id === team.id));
};

export const mapEventData = (eventData) => {
    return Object.assign({}, eventData, {
        dates: mapMatchesToDates(eventData)
    });
};
