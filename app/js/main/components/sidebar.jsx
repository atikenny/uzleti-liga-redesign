import React, { PropTypes }     from 'react';
import { connect }              from 'react-redux';

export const Sidebar = ({ isOpen }) => {
    let sidebarClass = 'sidebar';

    if (isOpen) {
        sidebarClass += ' open';
    }

    return (
        <div className={sidebarClass}>
            <ul>
                <li>
                    <span><a href="#basketball">Kosárlabda</a></span>
                </li>
            </ul>
        </div>
    );
};

const mapState = ({ isSidebarOpen }) => {
    return {
        isOpen: isSidebarOpen
    };
};

export default connect(mapState)(Sidebar);

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired
};
