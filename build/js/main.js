document.addEventListener('DOMContentLoaded', function(event)  {
    ReactDOM.render(
        React.createElement(BusinessLeague, null),
        document.getElementById('business-league-app')
    );
});

const BusinessLeague = React.createClass({displayName: "BusinessLeague",
    getInitialState:function() {
        return {
            isSidebarOpen: false  
        };
    },
    openSidebar:function() {
        this.setState({
            isSidebarOpen: !this.state.isSidebarOpen
        });
    },
	render:function() {
		return (
            React.createElement("div", null, 
                React.createElement(Header, {openSidebar: this.openSidebar}), 
                React.createElement(Sidebar, {isOpen: this.state.isSidebarOpen})
            )
		);
	}
});
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
const Header = React.createClass({displayName: "Header",
    render:function() {
        return (
            React.createElement("header", {id: "main-app-header"}, 
                React.createElement("button", {className: "hamburger-menu", onClick: this.props.openSidebar}, 
                    React.createElement("i", {className: "material-icons"}, "menu")
                ), 
                React.createElement("span", {className: "logo"}), 
                React.createElement("span", {className: "page-name"}, this.props.pageName), 
                React.createElement("button", {className: "stats-button"}, 
                    React.createElement("i", {className: "material-icons"}, "assessment")
                ), 
                React.createElement("button", {className: "filter-button"}, 
                    React.createElement("i", {className: "material-icons"}, "filter_list")
                ), 
                React.createElement("button", {className: "today-button"}, 
                    React.createElement("i", {className: "material-icons"}, "today")
                ), 
                React.createElement("button", {className: "login-button"}, 
                    React.createElement("i", {className: "material-icons"}, "account_box")
                )
            )
        );
    }
});
const Sidebar = React.createClass({displayName: "Sidebar",
    render:function() {
        let sidebarClass = 'sidebar';

        if (this.props.isOpen) {
            sidebarClass += ' open';
        }

        return (
            React.createElement("div", {className: sidebarClass}, 
                React.createElement("ul", null, 
                    React.createElement("li", null, 
                        React.createElement("span", null, React.createElement("a", {href: "#basketball"}, "Kosárlabda"))
                    )
                )
            )
        );
    }
});
//# sourceMappingURL=main.js.map
