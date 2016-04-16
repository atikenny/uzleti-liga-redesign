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