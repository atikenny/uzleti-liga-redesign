import React from 'react';

import Header from './header';
import Sidebar from './sidebar';
import Matches from './matches';

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
