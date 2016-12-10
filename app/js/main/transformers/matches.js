const getDayFromDate = (date) => {
    return date.substring(0, 10);
};

export const mapMatchesToDates = (matches) => {
    return matches.reduce((dates, match) => {
        const matchDay = getDayFromDate(match.date);
        const date = dates.find(date => date.day === matchDay);

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
