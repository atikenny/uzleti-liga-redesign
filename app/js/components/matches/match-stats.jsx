import React, { PropTypes } from 'react';

const getPeriodsCount = (teams) => {
    let periodsCount = 0;

    teams.forEach(team => {
        team.players.forEach(player => {
            const playerPeriodsCount = player.stats.periods.length;

            if (playerPeriodsCount > periodsCount) {
                periodsCount = playerPeriodsCount;
            }
        });
    });

    return (new Array(periodsCount)).fill(1); // create a periods count long array for easier iteration
};

const renderTeamStats = (teamStats, periods) => (
    <table className='table'>
        <thead>
            <tr>
                <th>{teamStats.name}</th>
                {periods.map((period, index) => (
                <th key={index}>Q{index + 1}</th>
                ))}
                <th></th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>H</th>
            </tr>
        </thead>
        <tbody>
            {teamStats.players.map((player, index) => (
                <tr key={index}>
                    <td className='player-name'>{player.name}</td>
                    {player.stats.periods.map((period, index) => (
                    <td key={index} className='period-sum'>{period.scoreSum}</td>
                    ))}
                    <td className='sum-score'>{player.stats.sumScore}</td>
                    <td>{player.stats.freeThrowCount}</td>
                    <td>{player.stats.fieldGoalCount}</td>
                    <td>{player.stats.threePointerCount}</td>
                    <td>{player.stats.fouls}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const MatchStats = ({ match }) => {
    const periods = getPeriodsCount([match.homeTeam, match.awayTeam]);

    return (
        <div className='match-stats-container'>
            <div className='home-stats match-stats'>
                {renderTeamStats(match.homeTeam, periods)}
            </div>
            <div className='away-stats match-stats'>
                {renderTeamStats(match.awayTeam, periods)}
            </div>
        </div>
    );
};

export default MatchStats;

MatchStats.propTypes = {
    match: PropTypes.object.isRequired
};
