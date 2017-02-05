import { createSelector } from 'reselect';

const getEventLeague = (state) => state.appData.data.league;
const getEventYear = (state) => state.appData.data.year;
const getEventSeason = (state) => state.appData.data.season;

export const getPageName = createSelector([getEventLeague, getEventYear, getEventSeason], (league, year, season) => {
    let pageName = league;

    if (year) {
        pageName += ` ${year}`;
    }

    if (season) {
        pageName += ` ${season}`;
    }

    return pageName;
});
