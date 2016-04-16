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