const mainApp = (function()  {
    const clean = function()  {
        const setTitle = function()  {
            document.title = 'Üzleti Liga';
        };

        const clearBody = function()  {
            $('body').empty();
        };

        const removeStyles = function()  {
            $('head link[rel="stylesheet"]').remove();
        };

        const removeScripts = function()  {
            $('head script').remove();
        };

        const appendMainAppContainer = function()  {
            $('body').append('<div id="business-league-app"></div>');
        };

        const appendMetaTags = function()  {
            $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
        };

        setTitle();
        clearBody();
        removeStyles();
        removeScripts();
        appendMainAppContainer();
        appendMetaTags();
    };

    const insertApp = function()  {
        ReactDOM.render(
            React.createElement(BusinessLeague, null),
            document.getElementById('business-league-app')
        );
    };

    return {
        clean:clean,
        insertApp:insertApp
    };
})();