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