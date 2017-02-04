import React, { PropTypes }     from 'react';
import { connect }              from 'react-redux';

import { toggleSidebar }        from '../actions/sidebar';
import { getPageName }          from '../selectors/page';

// For testing purposes we also export the unwrapped component
// Reference: http://redux.js.org/docs/recipes/WritingTests.html
export const Header = ({ toggleSidebar, pageName }) => (
    <header id="main-app-header">
        <button className="hamburger-menu" onClick={toggleSidebar}>
            <i className="material-icons">menu</i>
        </button>
        <span className="logo"></span>
        <span className="page-name">{pageName}</span>
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

const mapState = (state) => {
    return {
        pageName: getPageName(state)
    };
};

const mapDispatch = (dispatch) => {
    return {
        toggleSidebar: () => {
            dispatch(toggleSidebar());
        }
    };
};

export default connect(mapState, mapDispatch)(Header);

Header.propTypes = {
    toggleSidebar: PropTypes.func.isRequired,
    pageName: PropTypes.string
};
