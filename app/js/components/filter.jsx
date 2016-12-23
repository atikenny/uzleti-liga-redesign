const Filter = React.createClass({
    render() {
        const finishedMatchesButtonClass = this.props.showFinishedMatches ? 'active' : '';
        const allTeamsButtonClass = this.props.showAllTeams ? 'active' : '';

        return (
            <div class="main-controls">
                <button class="show-finished-matches {finishedMatchesButtonClass}">végetért meccsek</button>
                <button class="show-all-teams {allTeamsButtonClass}">összes csapat</button>
            </div>
        );
    }
});