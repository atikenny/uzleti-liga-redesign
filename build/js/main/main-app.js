const mainApp = (function()  {
    const clean = function()  {
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

        clearBody();
        removeStyles();
        removeScripts();
        appendMainAppContainer();
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