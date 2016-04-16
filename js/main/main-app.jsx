const mainApp = (() => {
    const clean = () => {
        const setTitle = () => {
            document.title = 'Üzleti Liga';
        };

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

        const appendMetaTags = () => {
            $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
        };

        setTitle();
        clearBody();
        removeStyles();
        removeScripts();
        appendMainAppContainer();
        appendMetaTags();
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