const Sidebar = React.createClass({
    render() {
        let sidebarClass = 'sidebar';

        if (this.props.isOpen) {
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
    }
});