const Filter = React.createClass({displayName: "Filter",
    render:function() {
        const finishedMatchesButtonClass = this.props.showFinishedMatches ? 'active' : '';
        const allTeamsButtonClass = this.props.showAllTeams ? 'active' : '';

        return (
            React.createElement("div", {class: "main-controls"}, 
                React.createElement("button", {class: "show-finished-matches {finishedMatchesButtonClass}"}, "végetért meccsek"), 
                React.createElement("button", {class: "show-all-teams {allTeamsButtonClass}"}, "összes csapat")
            )
        );
    }
});