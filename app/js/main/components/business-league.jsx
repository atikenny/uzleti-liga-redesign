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
            <div id='wrapper'>
                <Header openSidebar={this.openSidebar} />
                <Sidebar isOpen={this.state.isSidebarOpen} />
                <Matches />
            </div>
		);
	}
});

export default BusinessLeague;
