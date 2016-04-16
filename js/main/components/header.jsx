const Header = React.createClass({
    render() {
        return (
            <header id="main-app-header">
                <button className="hamburger-menu" onClick={this.props.openSidebar}>
                    <i className="material-icons">menu</i>
                </button>
                <span className="logo"></span>
                <span className="page-name">{this.props.pageName}</span>
                <button className="stats-button">
                    <i className="material-icons">assessment</i>
                </button>
                <button className="filter-button">
                    <i className="material-icons">filter_list</i>
                </button>
                <button className="today-button">
                    <i className="material-icons">today</i>
                </button>
                <button className="login-button">
                    <i className="material-icons">account_box</i>
                </button>
            </header>
        );
    }
});