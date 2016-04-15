const mainApp = (() => {
    const clean = () => {
        const clearBody = () => {
            $('body').empty();
        };

        const removeStyles = () => {
            $('head link[rel="stylesheet"]').remove();
        };

        const removeScripts = () => {
            $('head script').remove();
        };

        const appendMainAppContainer = () => {
            $('body').append('<div id="business-league-app"></div>');
        };

        clearBody();
        removeStyles();
        removeScripts();
        appendMainAppContainer();
    };

    const insertApp = () => {
        ReactDOM.render(
            <BusinessLeague />,
            document.getElementById('business-league-app')
        );
    };

    return {
        clean,
        insertApp
    };
})();