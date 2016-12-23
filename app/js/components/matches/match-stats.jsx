import React, { PropTypes } from 'react';

const renderTeamStats = (teamStats) => (
    <table className='table'>
        <thead>
            <tr>
                <th>{teamStats.name}</th>
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

const MatchStats = ({ match }) => (
    <div className='match-stats-container'>
        <div className='home-stats match-stats'>
            {renderTeamStats(match.homeTeam)}
        </div>
        <div className='away-stats match-stats'>
            {renderTeamStats(match.awayTeam)}
        </div>
    </div>
);

export default MatchStats;

MatchStats.propTypes = {
    match: PropTypes.object.isRequired
};
