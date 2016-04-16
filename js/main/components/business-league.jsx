const BusinessLeague = React.createClass({
    getInitialState() {
        return {
            isSidebarOpen: false  
        };
    },
    openSidebar() {
        this.setState({
            isSidebarOpen: !this.state.isSidebarOpen
        });
    },
	render() {
		return (
            <div>
                <Header openSidebar={this.openSidebar} />
                <Sidebar isOpen={this.state.isSidebarOpen} />
            </div>
		);
	}
});